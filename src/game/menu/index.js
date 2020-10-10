import React from 'react';
import ReactDOM, { render } from 'react-dom';
import './index.css';
import disconnect from '../disconnect';
import connect from '../../serverbrowser/connect';
import ColorPicker from './colorpicker/';
import toggleUI from './toggleUI';
import d from '../../d'

function pause() {
    document.getElementById('pauseMenu').style.display = 'block';
    document.getElementById('pauseButton').style.visibility = 'hidden';
}

function unpause() {
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('pauseButton').style.visibility = null;
}

function isPaused() {
    return document.getElementById('pauseMenu').style.display == 'block';
}

function reconnect() {
    unpause();
    disconnect();
    setTimeout(() => connect(d.server), 1);
}

function changeControl() {
    let method = Number(document.getElementById('controlMethod').value);
    let joystickDiv = document.getElementById('joystickControls');
    if (method == 3) {
        joystickDiv.style.display = '';
    } else {
        joystickDiv.style.display = 'none';
    }
}

class PauseMenu extends React.Component {
    render() {
        return (
            <div>
                <button id="pauseButton" onClick={pause} style={{display: "block"}} />
                <div id="pauseMenu" style={{display: "none"}}>
                    <center id="pauseMenuContents">
                        <button onClick={unpause}>Resume</button><br />
                        <ColorPicker />
                        <button onClick={toggleUI}>Toggle UI</button><br />
                        <button onClick={reconnect}>New ship</button><br />
                        <button onClick={() => disconnect()}>Disconnect</button><br />
                        <label htmlFor="controlMethod" style={{color: 'white'}}>Control method: </label>
                        <select id="controlMethod" onChange={changeControl}>
                            <option value={0}>steer</option>
                            <option value={1}>d-pad</option>
                            <option value={2}>mouse</option>
                            <option value={3}>joystick</option>
                        </select>
                        <hr />
                        <p>
                            Server: {d.server.url}<br />
                            Ping: <span id="ping">(pinging...)</span>ms<br />
                            FPS: <span id="FPSDisplay">(waiting for frame...)</span>
                        </p>
                    </center>
                </div>
            </div>
        );
    }

    componentDidMount() {
        document.getElementById('controlMethod').value = 1;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) //if client's device is a mobile device
            document.getElementById('controlMethod').value = 3;
        changeControl();
    }
}

export default PauseMenu;

export {
    PauseMenu,
    pause,
    unpause,
    isPaused,
};