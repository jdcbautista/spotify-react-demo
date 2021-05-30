import React, { Component } from 'react';
import {FaPause, FaPlay} from "react-icons/fa";
// class SearchHandler extends Component {
//     constructor(props) {
//         super(props);
        
//     }
    
//     this.props.results.map(function(item, i){
//         console.log('test');
//         return <li key={i}>Test</li>
//     })
    

//     render() {
//         return (
//             <div>
                
//             </div>
//         );
//     }
// }

// export default SearchHandler;

export default function SearchHandler(props) {
    const results = props.results
    const handleClick = (thisItem) => {
        props.playSearchResult(thisItem.id)
        console.log(thisItem.artist, thisItem.name)
    }
    const listItems = results.map((item) => 
        <li key={"item-"+ item.id}>
            <div onClick={() => {
                handleClick(item)
            }}>
            <FaPlay/>{item.name}, {item.artist}
            </div>
        </li>
    )
    return <ul>{listItems}</ul>
}