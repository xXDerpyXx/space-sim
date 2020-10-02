import React from 'react';
import './index.css';
import d from '../../d';

function handleChange() {
    let power = Number(document.getElementById('throttle').value);
    document.getElementById('throttleDisplay').innerHTML = power.toFixed(2);
    d.socket.emit('throttle', power);
}

class Throttle extends React.Component {
    render() {
        return (
            <div id="throttleDiv">
                <input id="throttle" type='range' orient='vertical' onChange={handleChange} min={0} max={1} step={0.01}></input>
                <span id="throttleDisplay" style={{color: 'white'}}></span>
            </div>
        );
    }

    componentDidMount() {
        document.getElementById('throttle').value = 0.2;
        handleChange();
    }
}

export default Throttle;

export {
    Throttle,
    handleChange
};