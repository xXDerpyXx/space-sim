import React from 'react';
import { CirclePicker } from 'react-color';
import './index.css';
import d from '../../../d';

class ColorPicker extends React.Component {
    state = {
        background: '#000000',
    };

    handleChangeComplete = (color, event) => {
        this.setState({ background: color.hex });
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
        "#8bc34a",
        "#cddc39",
        "#ffeb3b",
        "#ffc107",
        "#ff9800",
        "#ff5722",
        "#795548",
        "#607d8b",
        //line break
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        //line break
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
        "#673ab7",
    ];

    render() {
        return <CirclePicker width="310px" colors={this.colors} circleSize={12} onChangeComplete={ this.handleChangeComplete } />;
    }
}

export default ColorPicker;