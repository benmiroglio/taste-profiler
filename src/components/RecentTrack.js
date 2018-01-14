import React,  { Component } from 'react';
import './css/RecentTrack.css'
export class RecentTrack extends Component {


	render() {
		return (
			<div className="RecentTrack">
			  <div className="RecentTrackInfo">
			  	<center>
				<h3>{this.props.track.name}</h3>
			    <p>{this.props.track.artist_name} | {this.props.track.album}</p>
			    </center>
			  </div>
			</div>
		)
	}
}