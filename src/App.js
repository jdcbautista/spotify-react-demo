import React, {Component} from 'react';
import SpotifyPlayerContainer from "./SpotifyPlayerContainer";
// import SpotifySearch from "./SpotifySearch.js";


class App extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            artist: ''

        }
    }

    render() {
        return (<SpotifyPlayerContainer
            // playingRecordingId="spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
            />);
    }
}

export default App;
