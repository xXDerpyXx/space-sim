import React from 'react';
import JoyStick from 'react-joystick';
import d from '../../d';

const joyOptions = {
    mode: 'dynamic',
    catchDistance: 150,
    color: 'white'
}

const containerStyle = {
    position: 'relative',
    height: '4000px',
    width: '100%',
    background: 'rgba(0, 0, 0, 0)'
}


class JoyWrapper extends React.Component {
    constructor() {
        super();
        this.managerListener = this.managerListener.bind(this);
    }

    managerListener(manager) {
        manager.on('start', () => {
            d.socket.emit('accelerate', true);
        });
        manager.on('end', () => {
            d.socket.emit('accelerate', false);
        });
        manager.on('move', (e, stick) => {
            d.socket.emit('setangle', 360 - stick.angle.degree)
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div id="joystickControls" style={{display: 'none'}}>
                <JoyStick joyOptions={joyOptions} containerStyle={containerStyle} managerListener={this.managerListener} />
            </div>
        );
    }
}

export default JoyWrapper;