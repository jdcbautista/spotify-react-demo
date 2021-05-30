import React, {Component} from 'react';
import SpotifyPlayerContainer from "./SpotifyPlayerContainer";


class App extends Component <any, any>{
    
    constructor(props: any) {
        super(props);
        
    }

    render() {
        return (<SpotifyPlayerContainer
            playingRecordingId="spotify:track:4iV5W9uYEdYUVa79Axb7Rh"/>);
    }
}

export default App;
