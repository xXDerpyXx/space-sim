import React from 'react';
import { SketchPicker } from 'react-color';
import './index.css';
import d from '../../../d';

class ColorPicker extends React.Component {
    state = {
        background: '#000000',
    };

    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    };

    handleChangeComplete = (color, event = null) => {
        d.socket.emit('changeColor', color.hex);
    };

    colors = [
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4caf50",
    ];

    render() {
        return (
            <div>
                <button onClick={this.handleClick}>Toggle ship color picker</button>
                {this.state.displayColorPicker ? <SketchPicker width="130px" disableAlpha={true} presetColors={this.colors} onChangeComplete={this.handleChangeComplete} /> : null}
            </div>
        );
    }
}

export default ColorPicker;