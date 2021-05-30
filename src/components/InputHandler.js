import React from 'react';

// export default function InputHandler(props) {
//     const [input, setInput] = React.useState(props.query);

//     function handleChange(e) {
//         setInput({value: e.target.value});
//     }

//     return(
//         <div className="box">
//             <label className="label">Enter search here:</label>
//             <input type="text" id="input" value={input} onChange={handleChange} />
//             {console.log(this.state.input)}
//             <input > </input>
//         </div>
//     )
// }

class InputHandler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: 'HELLO WORLD'};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({value: e.target.value});

    }

    render() {
        return(
            <div className="box">
                <label className="label">Enter search here:</label>
                <input type="text" id="input" value={this.state.value} onChange={this.handleChange} />
                {console.log(this.state.input)}
             <input > </input>
            </div>
        )
    }

}

export default InputHandler