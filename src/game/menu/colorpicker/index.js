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
        "#d48f22",
        "#bd0808",
        "#e91e63",
        "#ff6bdc",
        "#71157d",
        "#1f138a",
        "#49d1de",
        "#38d674",
        "#0dbd22",
        "#fff45e",
        "#9c9c9c",
        "#363636",
        "#7be3a8",
        "#877be3",
        "#6b6547",
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