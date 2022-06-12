import React from 'react'
import { connect } from 'react-redux';
import * as globalActions from 'actions/GlobalActions';

class SmallAudio extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			status: 'stop' , 
			loaded:false,
		}
		 let audioLink = window.Laravel.baseURL + 'api/download-call-file/' + this.props.campaign_id + '/' + this.props.audioFileName
		 console.log(audioLink);
		 this.audio = new Audio(audioLink);

		 this.audio.addEventListener('ended', this.toggleState.bind(this));
		 this.audio.addEventListener('loadeddata', this.loadedFile.bind(this));
	}
	loadedFile(){
		this.setState({loaded:true});
	}
 
	/**
	 * Get statu icon class and style
	 * 
	 * @return void
	 */
	getStatusIcon() {
		this.statusIconClass = (this.state.status == 'stop')? "fa fa-play" : "fa fa-stop";
		this.statusIconStyle = (this.state.status == 'stop')? {color: '#498BB6', opacity:(this.props.isPlayingAudio ? '0.4' : ''), cursor:(this.props.isPlayingAudio ? 'not-allowed' : 'pointer')} : {color: '#d9534f' };
	}

	/**
	 * Toggle audio state
	 *
	 * @param object e
	 * @return void
	 */
	toggleState(e) {
		if (this.state.status == 'stop') {
			this.props.dispatch({type:globalActions.ActionTypes.SET_SMALL_AUDIO_PLAYING , isPlayingAudio:true});
			this.audio.play();
			this.setState({
				status: 'play'
			});
		} else {
			this.props.dispatch({type:globalActions.ActionTypes.SET_SMALL_AUDIO_PLAYING , isPlayingAudio:false});
			this.audio.pause();
			this.audio.currentTime = 0;
			this.setState({
				status: 'stop'
			});			
		}
	}

	render() {
		this.getStatusIcon()
		if(this.state.loaded){
		return (
			<div>
				<i className={this.statusIconClass} onClick={((this.state.status == 'stop' && this.props.isPlayingAudio) ? null : this.toggleState.bind(this))} style={this.statusIconStyle}></i>
			</div>
		)
		}
		else{
			return <div></div>
		}
	}
	
	componentWillUnmount(){
		if(this.props.isPlayingAudio){
			this.props.dispatch({type:globalActions.ActionTypes.SET_SMALL_AUDIO_PLAYING , isPlayingAudio:false});
		}
		if(this.state.status != 'stop'){
			this.audio.pause();
			this.audio.currentTime = 0;
			this.setState({
				status: 'stop'
			});	
		}
	}
}

function mapStateToProps(state) {
    return {
        isPlayingAudio: state.global.isPlayingAudio,
    };
}

export default connect(mapStateToProps)(SmallAudio);