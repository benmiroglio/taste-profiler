import React,  { Component } from 'react';
import { RecentTrack } from './RecentTrack';
import "./css/RecentTrackList.css"

export class RecentTrackList extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const minDate = Math.min.apply(null, this.props.dates)
		return (
		<div>
			<div className="RecentTrackList">
				{this.props.recentlyPlayedTracks.map((track, i) => {
					return <RecentTrack key={'track_' + i} track={track} />
				})}
			</div>
		</div>
		)
	}
}