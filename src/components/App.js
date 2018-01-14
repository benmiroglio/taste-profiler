import React, { Component } from 'react';
import './css/App.css';
import { Spotify } from '../util/Spotify'
import { RecentTrackList } from './RecentTrackList';
import { BarChart } from './BarChart'
import { combineDailyGenres } from '../util/stats'


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recentlyPlayedTracks: [],
      recentlyPlayedTracksAudioFeatures: {},
      playlistAndSavedTracks: [],
      playlistAndSavedTracksAudioFeatures: {},
      userId: null,
      userName: null
    }
    this.getData = this.getData.bind(this);
    this._registerScopes();
  }
  
  getData() {
    this._getUserInfo();
    this._getRecentlyPlayedTracks();
    this._getPlaylistAndSavedTracks();
  }

  _registerScopes() {
    Spotify.registerScopes();
  }

  _getUserInfo() {
    Spotify.registerScopes().then(userInfo => {
      this.setState({
        "userId": userInfo.id,
        "userName": userInfo.display_name})
    })
  }

  _getRecentlyPlayedTracks() {
    Spotify.getRecentlyPlayedTracks().then(tracks => {
        const formattedTracks = tracks.map(obj => {
          const track = obj.track;
          const played_at = obj.played_at.substr(0, 10);
          if (track.album.name === "Pig Lib") {
            console.log("PIG LIB", obj)
          }
          return {
            artist_name: track.artists[0].name,
            artist_id: track.artists[0].id,
            popularity: track.popularity,
            name: track.name,
            id: track.id,
            album: track.album.name,
            date: played_at
          }
        });
       this.setState({'recentlyPlayedTracks': formattedTracks},
        this._getRecentlyPlayedTracksAudioFeatures);
    });
  }

  _getRecentlyPlayedTracksAudioFeatures() {
    if (Object.keys(this.state.recentlyPlayedTracksAudioFeatures).length > 0) {
      console.log("Already fetched data")
      return;
    }
      Spotify.getAudioFeatures(this.state.recentlyPlayedTracks).then(agg => {
      console.log("AGG", agg)
        this.setState({'recentlyPlayedTracksAudioFeatures': agg},
         this._getRecentArtistGenres)
      });
  }

  _getRecentArtistGenres() {
     Spotify.getArtistGenres(this.state.recentlyPlayedTracks).then(agg => {
      let audioFeatures = this.state.recentlyPlayedTracksAudioFeatures;
      console.log("AGG", agg)
      Object.keys(agg).forEach(k => {
        audioFeatures[k]['artist_meta'] = agg[k]
      })
      this.setState({'recentlyPlayedTracksAudioFeatures':  audioFeatures})
      });
  }

  _getPlaylistAndSavedTracks() {
    if (this.state.playlistAndSavedTracks.length > 0) {
      console.log("Already fetched data")
      return;
    } else {
      this._getPlaylistTracks();
      this._getSavedTracks();
    }
  }

  _getPlaylists() {
    const playlistIds = Spotify.getPlaylists().then(playlistIds => playlistIds);
    return playlistIds;
  }

  _getPlaylistTracks() {
      this._getPlaylists().then(playlistIds => {;
      playlistIds.map(playlist => {
        Spotify.getPlaylistTracks(this.state.userId, playlist).then(tracks => {
          const playlistTracksUpdated = this.state.playlistAndSavedTracks.concat(tracks);
          this.setState({'playlistAndSavedTracks':  playlistTracksUpdated})
          });
      });
    });
  }
  _getSavedTracks() {
    Spotify.getSavedTracks().then(tracks => {
        const savedTracksUpdated = this.state.playlistAndSavedTracks.concat(tracks);
        this.setState({'playlistAndSavedTracks':  savedTracksUpdated}, 
          this._getPlaylistAndSavedTracksAudioFeatures);
        })
  }

  _getPlaylistAndSavedTracksAudioFeatures() {
    console.log('pok')
    if (Object.keys(this.state.playlistAndSavedTracksAudioFeatures).length > 0) {
      console.log("Already fetched data")
      return;
    }
      Spotify.getAudioFeatures(this.state.playlistAndSavedTracks).then(agg => {
        this.setState({'playlistAndSavedTracksAudioFeatures': agg}, this._getPlaylistAndSavedTracksArtistGenres)
      });
  }

  _getPlaylistAndSavedTracksArtistGenres() {
    console.log('state', this.state)
    Spotify.getArtistGenres(this.state.playlistAndSavedTracks).then(agg => {
      let audioFeatures = this.state.playlistAndSavedTracksAudioFeatures;
      Object.keys(agg).forEach(k => {
        audioFeatures[k]['artist_meta'] = agg[k]
      })
      this.setState({'playlistAndSavedTracksAudioFeatures': audioFeatures})

    })
  }




  render() {
    const appOptions =    
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Spotify Taste Profiler</h1>
        <hr/>
        <p> Hi {this.state.userName}!</p>
      </header>
      <center>
        <button className="btn btn-primary" onClick={() => this.getData()}> 
        GET ALL </button>
        </center>
    </div>

    const getStarted = 
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Spotify Taste Profiler</h1>
        <hr/>
        <p> Hi!</p>
      </header>
        <center>
        <button className="btn btn-primary" onClick={() => this._getUserInfo()}> 
        GET STARTED </button>
        </center>
    </div>

    const grid = 
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Spotify Taste Profiler</h1>
        <hr/>
      <p> Hi {this.state.userName}! Here is your data.</p>
      </header>
      <BarChart data={combineDailyGenres(this.state.recentlyPlayedTracksAudioFeatures)}
                size={[500, 500]}/>

       <div className="recent-tracks-container">
        <h3> Here are you recent tracks </h3>

        <RecentTrackList dates={this.state.recentlyPlayedTracks.map(i => new Date(i.played_at))} 
                         recentlyPlayedTracks={this.state.recentlyPlayedTracks}/>
       </div>
    </div>

    if (Object.keys(this.state.playlistAndSavedTracksAudioFeatures).length > 0){
      return (grid)
    }

    if (window.location.href.match(/access_token=([^&]*)/) || this.state.userId) {
      return (appOptions);
    }
    return (getStarted)
  }
}

export default App;
