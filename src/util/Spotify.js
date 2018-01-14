import { aggregateByKey, 
		 aggregateNestedArray,
	     combineAndAggregateNestedArray,
	     normalize } from './stats';

const clientId = '';
const redirect_uri = 'http://localhost:3000';
const _scopes = [
	'user-read-private',
	'user-read-recently-played',
	'playlist-read-private',
	'user-library-read'
];
const _audioFeatureFields = [
	'danceability',
	'duration_ms',
	'energy',
	'instrumentalness',
	'key',
	'liveness',
	'loudness',
	'mode',
	'speechiness',
	'tempo',
	'valence'
];

let accessToken;
let expirationTime;

export const Spotify = {
	// log a user into spotify requesting access
	// to passed in scpoes
	getAccessToken(scopes=[]) {
		if (accessToken) {
			return accessToken;
		} else {
			const accessTokenParam = window.location.href.match(/access_token=([^&]*)/);
			const expirationTimeParam =  window.location.href.match(/expires_in=([^&]*)/);
			if (accessTokenParam && expirationTimeParam) {
				accessToken = accessTokenParam[1];
				expirationTime = expirationTimeParam[1];
				window.setTimeout(() => accessToken = '', expirationTime * 1000);
		        window.history.pushState('Access Token', null, '/');
		        return accessToken;
			} else {
				let url = 'https://accounts.spotify.com/authorize' +
			           '?client_id=' + clientId +
			           '&response_type=token' +
			           '&redirect_uri=' + encodeURIComponent(redirect_uri)
			    if (scopes) {
			    	url += '&scopes=' + scopes
			    }
				//redirect to spotify auth page
				window.location.replace(url);
			}
		}
	},
	async registerScopes() {
		const url = 'https://api.spotify.com/v1/me'
		const jsonResponse = await this.makeRequest(url, _scopes)
		return {
			display_name: jsonResponse.display_name,
			id: jsonResponse.id
		}

	},
	// gets a user's last 50 played track objects
	async getRecentlyPlayedTracks() {
		const url = 'https://api.spotify.com/v1/me/player/recently-played' +
				  '?client_id=' + clientId +
				  '&limit=50' 
		const jsonResponse = await this.makeRequest(url, ['user-read-recently-played']);
		return jsonResponse.items
	},
	// gets list of ids for a uers's playlists
	async getPlaylists() {
		const url = 'https://api.spotify.com/v1/me/playlists' +
				  '?client_id=' + clientId +
				  '&limit=50' +
				  '&offset='
		let offset = 0;
		let playlistIds = []
		let playlistIdsCurr;
		while (offset <= 100) {
			playlistIdsCurr = await this.offsetHandler(url, ['playlist-read-private'], offset);
			playlistIds = playlistIds.concat(playlistIdsCurr)
			if (playlistIdsCurr.length < 50) {
				return playlistIds;
			}
			offset += 50;
		}
		return playlistIds;
	},
	// get the tracks contained in a user's playlists
	async getPlaylistTracks(userId, playlistId) {
		let url = 'https://api.spotify.com/v1/users/' + userId + 
		      '/playlists/' + playlistId + '/tracks' + 
			  '?clientId=' + clientId +
			  '&limit=100' +
			  '&offset='
		let offset = 0;
		let tracks = [];
		while (offset <= 5000) {
			let tracksCurr = await this.offsetHandler(url, ['playlist-read-private'], offset, (i) => {
				return {
					artist_name: i.track.artists[0].name,
          			artist_id: i.track.artists[0].id,
					date: i.added_at.substr(0, 10),
					popularity: i.track.popularity,
          			name: i.track.name,
          			id: i.track.id,
          			album: i.track.album.name,
				}
			});
			tracks = tracks.concat(tracksCurr);
			if (tracksCurr.length < 100) {
				return tracks;
			}
			offset += 100
		}
		return tracks;
	},
	// get a user's saved tracks
	async getSavedTracks() {
		const url = 'https://api.spotify.com/v1/me/tracks' + 
		      '?clientId=' + clientId +
		 	  '&limit=50' +
		 	  '&offset=';
		let offset = 0;
		let tracks = []
		while (offset <= 5000) {
			let tracksCurr = await this.offsetHandler(url, ['user-library-read'], offset, (i) => {
				return {
					artist_name: i.track.artists[0].name,
          			artist_id: i.track.artists[0].id,
					date: i.added_at.substr(0, 10),
					popularity: i.track.popularity,
          			name: i.track.name,
          			id: i.track.id,
          			album: i.track.album.name,
				}
			});
			tracks = tracks.concat(tracksCurr);
			if (tracksCurr.length < 50) {
				return tracks;
			}
			offset += 50
		}
		return tracks;
	},

	async getAudioFeatures(tracks) {
		const trackIds = tracks.map(i => i.id);
		const datesAdded = tracks.map(i => i.date);
	    const featureBounds = {};
		_audioFeatureFields.forEach(i => featureBounds[i] = {min: Infinity, max: 0});
		let audioFeatures = [];
		let audioFeaturesCurr, audioFeaturesCurrSubset, trackIdsCurr, url;
		while (trackIds.length > 0) {
			trackIdsCurr = trackIds.splice(0, 100);
			url = 'https://api.spotify.com/v1/audio-features' + 
					  '?clientId=' + clientId +
					  '&ids=' + trackIdsCurr.join(',');
			audioFeaturesCurr = await this.makeRequest(url, []);
			audioFeaturesCurrSubset = audioFeaturesCurr.audio_features.map(i => {
				if (i) {
					const subset = {};
					Object.keys(featureBounds).forEach(f => {
						subset[f] = i[f]
						featureBounds[f].min = Math.min(featureBounds[f].min, i[f]);
					    featureBounds[f].max = Math.max(featureBounds[f].max, i[f])

					});
					return subset;
				} else {
					return {};
				}
			})
			audioFeatures = audioFeatures.concat(audioFeaturesCurrSubset);

		}
		const aggAudioFeatures = aggregateByKey(datesAdded, audioFeatures);
		return normalize(aggAudioFeatures, featureBounds, 'date');
	},
	async getArtistGenres(tracks) {
		const artistIds = tracks.map(i => i.artist_id);
		const artistNames = tracks.map(i => [i.artist_name]);
		const dates = tracks.map(i => i.date);
		let genres = [];
		let url, artistIdsCurr, genresCurr;
		while (artistIds.length > 0) {
			artistIdsCurr = artistIds.splice(0, 50);
			url = 'https://api.spotify.com/v1/artists' + 
			  '?clientId=' + clientId +
			  '&ids=' + artistIdsCurr.join(',');
			genresCurr = await this.makeRequest(url, []);
			if (genresCurr.artists) {
				genres = genres.concat(genresCurr.artists.map(i => i.genres));
			}
		};
		const aggGenres = combineAndAggregateNestedArray(dates, genres)
		const aggArtistNames = combineAndAggregateNestedArray(dates, artistNames)
		const map = {};
		dates.forEach(d => {
			map[d] = {genres: aggGenres[d], artists: aggArtistNames[d]}
		})
		return map
		},
	// helper function for GET requests
	async makeRequest(url, scopes) {
		accessToken = this.getAccessToken(scopes);
		const headers = {'Authorization': 'Bearer ' + accessToken};
		const response = await fetch(url, {
			headers: headers
		});
		if (response.ok) {
			const jsonResponse = await response.json();
			return jsonResponse
		}
		else {
			console.log("Request failed")
			return {items: []};
		}
	},
	// helper function for users and playlists with <50 items
	async offsetHandler(url, scopes, offset, mapper= (i) => i.id) {
			url += offset
			const jsonResponse = await this.makeRequest(url, scopes)
			const items = jsonResponse.items
			if (items.length > 0) {
				return items.map(mapper)
			} else {
				return []
			}
	}

}

