import React, {Component} from 'react';
import {ScriptCache} from "./ScriptCache";
import SpotifyAuthWindow from "./SpotifyAuthWindow";
import {SpotifyAccess} from "./SpotifyAccess";
import {getSpotifyAccess, getSpotifyAccessToken} from "./LocalStorageData";
import {FaPause, FaPlay} from "react-icons/fa";
import styles from "./App.module.css";
import { isThisTypeNode } from 'typescript';

import SearchHandler from './components/SearchHandler.js'
import InputHandler from './components/InputHandler';

interface ISpotifyPlayerProps {
    playingRecordingId: string;
}

interface ISpotifyPlayerState {
    loadingState: string;
    spotifyAccessToken: string;
    spotifyAccess: SpotifyAccess;
    spotifyDeviceId: string;
    spotifySDKLoaded: boolean,
    spotifyAuthorizationGranted: boolean,
    spotifyPlayerConnected: boolean,
    spotifyPlayerReady: boolean,
    // spotifyPlayer: Spotify.SpotifyPlayer | undefined,
    spotifyPlayer: Spotify.Player | undefined,
    playbackOn: boolean,
    playbackPaused: boolean,
    currentArtist: string,
    query: string,
    results: Array<object>,
    currentTrack: string,
    inputValue: string,
    playingRecordingId: string,
}

// const Result = ({qResults}) => {
//     return qResults.map((r,i) => <div key={i}>{r}</div>)
// }
// function qResults(any: any) = {

// }

class SpotifyPlayerContainer extends Component <ISpotifyPlayerProps, ISpotifyPlayerState> {
    private connectToPlayerTimeout: any;

    public constructor(props: ISpotifyPlayerProps) {
        super(props);

        new ScriptCache([
            {
                name: "https://sdk.scdn.co/spotify-player.js",
                callback: this.spotifySDKCallback
            }]);

        window.addEventListener("storage", this.authorizeSpotifyFromStorage);

        this.state = {
            loadingState: "loading scripts",
            spotifyAccessToken: "",
            spotifyDeviceId: "",
            spotifyAuthorizationGranted: false,
            spotifyPlayerConnected: false,
            spotifyPlayerReady: false,
            spotifySDKLoaded: false,
            spotifyPlayer: undefined,
            spotifyAccess: SpotifyAccess.NOT_REQUESTED,
            playbackOn: false,
            playbackPaused: false,
            currentArtist: "",
            query: 'Search here',
            results: [],
            currentTrack: "",
            inputValue: 'Type search here',
            playingRecordingId: "spotify:track:"
        };

    }

    private spotifySDKCallback = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {

            if (this.state.spotifyAccess !== SpotifyAccess.DENIED) {
                const spotifyPlayer = new Spotify.Player({
                    name: 'React Spotify Player',
                    getOAuthToken: cb => {
                        cb(this.state.spotifyAccessToken);
                    }
                });

                // Playback status updates
                spotifyPlayer.addListener('player_state_changed', state => {
                    console.log(state);
                });


                this.setState({
                    loadingState: "spotify scripts loaded",
                    spotifyPlayer
                });

            } else {
                this.setState({loadingState: "spotify authorization rejected"});
            }
        }

    }

    private authorizeSpotifyFromStorage = (e: StorageEvent) => {

        if (e.key === "spotifyAuthToken") {
            const spotifyAccessToken = e.newValue;

            const spotifyAccess = getSpotifyAccess();

            if (spotifyAccess === SpotifyAccess.DENIED) {
                this.setState({
                    spotifyAccess: SpotifyAccess.DENIED,
                    loadingState: "spotify access denied"
                });
            } else if (spotifyAccessToken !== null) {
                this.setState({
                    spotifyAccessToken: spotifyAccessToken,
                    spotifyAccess: SpotifyAccess.ALLOWED,
                    loadingState: "spotify token retrieved"
                });
            }
            this.connectToPlayer();
        }
    }

    private connectToPlayer = () => {
        if (this.state.spotifyPlayer) {
            clearTimeout(this.connectToPlayerTimeout);
            // Ready
            this.state.spotifyPlayer.addListener('ready', ({device_id}) => {
                console.log('Ready with Device ID', device_id);
                this.setState({
                    loadingState: "spotify player ready",
                    spotifyDeviceId: device_id,
                    spotifyPlayerReady: true
                });
            });

            // Not Ready
            this.state.spotifyPlayer.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
            });

            this.state.spotifyPlayer.connect()
                .then((ev: any) => {
                    this.setState({loadingState: "connected to player"});
                });
        } else {
            this.connectToPlayerTimeout = setTimeout(this.connectToPlayer.bind(this), 1000);
        }
    }

    private startPlayback = (spotify_uri: string) => {
        fetch("https://api.spotify.com/v1/me/player/play?" +
            "device_id=" + this.state.spotifyDeviceId, {
            method: 'PUT',
            body: JSON.stringify({uris: [spotify_uri]}),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.spotifyAccessToken}`
            }
        }).then((ev) => {
            console.log(ev);
            if (ev.status === 403) {
                this.setState({
                    loadingState: "you need to upgrade to premium for playback",
                    spotifyAccess: SpotifyAccess.NO_PREMIUM
                });
            } else {
                this.setState({
                    loadingState: "playback started",
                    playbackOn: true, playbackPaused: false
                });
                console.log("Started playback", this.state);
            }
        }).catch((error) => {
            this.setState({loadingState: "playback error: " + error});
        })
    };

    private resumePlayback = () => {
        fetch("https://api.spotify.com/v1/me/player/play?" +
            "device_id=" + this.state.spotifyDeviceId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.spotifyAccessToken}`
            },
        }).then((ev) => {
            this.setState({playbackPaused: false});
        });
        console.log("Started playback", this.state);
    }

    private pauseTrack = () => {
        fetch("https://api.spotify.com/v1/me/player/pause?" +
            "device_id=" + this.state.spotifyDeviceId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.spotifyAccessToken}`
            },
        }).then((ev) => {
            this.setState({playbackPaused: true});
        })
    }

    private handleInputChange = (e: any) => {
        this.setState({inputValue: e.target.value})
    }

    private submitSearch = () => {
        if (this.state.inputValue.length > 0 && this.state.inputValue !== undefined) {
            this.setState({
                query: this.state.inputValue
            }, () => {

                fetch("https://api.spotify.com/v1/search?" + "q=" + this.state.query +
                "&device_id=" + this.state.spotifyDeviceId + "&type=track" + "&limit=9",{
                    method: 'GET',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.state.spotifyAccessToken}`
                    },
                }).then((response) => {
                    //return array of objects
                    //objects contain query results
                    response.json().then(data => {
                        console.log(data)
                        let results = []
                        for (var i=0; i < data.tracks.items.length; i++) {
                            let resultId = data.tracks.items[i].id
                            let resultTitle = data.tracks.items[i].name
                            let resultUri = data.tracks.items[i].uri
                            let resultArtist = data.tracks.items[i].artists[0].name
                            
                            results.push({
                                id: resultId,
                                name: resultTitle,
                                uri: resultUri,
                                artist: resultArtist
                            })
                            console.log(results)
                        
                        // for (var i=0; i < data.artists.items.length; i++) {
                        //     let resultId = data.artists.items[i].id
                        //     let resultName = data.artists.items[i].name
                        //     let resultUri = data.artists.items[i].uri
                        //     results.push({
                        //         id: resultId,
                        //         name: resultName,
                        //         uri: resultUri
                        //     })
                        //     console.log(results)
                        }
                        this.setState({results: results})
                    })
                    this.handleSearchResults()
                    // console.log(blah)
                    // if (response.status !== 400){
                    //     console.log("SUCCESS")
                    //     let r = response.json()
                    //     console.log(r)
                    //     return r
                    // }
                    // let response = JSON.parse(ev)
                    // console.log(ev)
                    // console.log(response)
                    // console.log({ev})
                    // console.log()
                    
                })
            })
        }
    }

    private handleSearchResults = () => {
        // for (let i=0; i< this.state.results.length; i++) {

        // }
        // this.state.results.map(function(item, i){
        //     return <li key={i}>Test</li>
        // })
        console.log("searching")
        return (
            <div>
                <ul>
                    {
                        // for(let i=0; i< this.state.results.length; )
                        this.state.results.map(function(item,i){
                            console.log('test');
                            <li key={i}>Test</li>
                        })
                    }
                </ul>
            </div>
        )
    }

    private playSearchResult = (id: string) => {
        this.setState({
            playingRecordingId:"spotify:track:"+id, 
            playbackOn:false,
        })
        this.startPlayback("spotify:track:"+id)
    }

    render() {
        return (
            <div className={styles.app}>
                <h3>Spotivibez</h3>
                <SpotifyAuthWindow/>
                <div className={styles.player}>
                    {this.state.spotifyPlayerReady && (!this.state.playbackOn || this.state.playbackPaused) &&
                    <div onClick={() => {
                        if (!this.state.playbackOn) {
                            this.startPlayback(this.state.playingRecordingId);
                        } else {
                            if (this.state.playbackPaused) {
                                this.resumePlayback();
                            }
                        }
                    }}>
                        <FaPlay/>
                    </div>}
                    {this.state.spotifyPlayerReady && this.state.playbackOn && !this.state.playbackPaused &&
                    <div onClick={() => {
                        if (!this.state.playbackPaused) {
                            this.pauseTrack();
                        } else {
                            this.resumePlayback();
                        }
                    }}>
                        <FaPause/>
                    </div>}
                <div>
                    <br></br>
                <p className={styles.statusMessage}>{this.state.loadingState}</p>

                </div>
                </div>
                <div>
                    <p>Track Switcher</p>
                    {/* {this.state.query !== undefined || null ? <p>Input</p> : <InputHandler query={this.state.query}/>} */}
                    <input type="text" id="input" value={this.state.inputValue} onChange={this.handleInputChange} />
                    Current artist: {this.state.currentArtist}
                    <button onClick={this.submitSearch}>Submit Search</button>
                    {console.log(this.state.results.length)}
                    {/* {console.log(this.state.results[0])} */}
                    {/* {this.state.results[0].resultName} */}
                    {/* {this.state.results[0] && this.state.results[0].name} */}
                    {this.state.results.length === 0 ? null : <SearchHandler playSearchResult={this.playSearchResult} results={this.state.results} playingRecordingId={this.state.playingRecordingId} startPlayback={this.startPlayback}/>}
                </div>

            </div>
        );
    }
}

export default SpotifyPlayerContainer;