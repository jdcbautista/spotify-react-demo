// import React, { Component } from 'react';

// class SpotifySearch extends Component {
//     constructor(props) {
//         super(props);

//         this.state = {
//             query: '',
//             results: [],
//             selected: ''
//         }
        
//     }
    
//     handleSearch = () => {
//         fetch("https://api.spotify.com/v1/search?"
//             {
//             method: 'PUT',
//             body: JSON.stringify({uris: [spotify_uri] }),
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${this.state.spotifyAccessToken}`
//             }
//             }
//         )
//     }
//     // 1. Request user input
//     // 2. Fetch API search endpoint

//     render() {
//         return (
//             <div>
                
//             </div>
//         );
//     }
// }

// export default SpotifySearch;