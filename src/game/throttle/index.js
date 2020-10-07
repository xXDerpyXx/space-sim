import React from 'react';
import { Slider } from '@material-ui/core';
import './index.css';
import d from '../../d';

const defaultThrottle = 0.2;

function handleChange(power) {
    document.getElementById('throttleLevel').innerHTML = power.toFixed(2);
    d.socket.emit('throttle', power);
}

function Throttle() {
    let [value, setValue] = React.useState(defaultThrottle);

    d.throttleSlider = {
        value,
        setValue,
    };

    React.useEffect(() => handleSliderChange(null, value)); //runs after render

    let handleSliderChange = (event, newValue) => {
        setValue(newValue);
        handleChange(newValue)
    };

    return (
        <div id="throttleDiv">
            <Slider
                min={0}
                max={1}
                step={0.01}
                value={value}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                valueLabelFormat={newValue => `Fuel usage: ${d.fuel.currentUsage.toFixed(2)}`}
            />
            <span id="throttleLevel">
                0.25
            </span>
        </div>
    );
}

export default Throttle;

export {
    Throttle,
    handleChange
};