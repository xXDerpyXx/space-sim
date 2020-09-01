import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import disconnect from '../disconnect';
import connect from '../../serverbrowser/connect';
import ColorPicker from './colorpicker/';
import d from '../../d'

function pause() {
    document.getElementById('pauseMenu').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'none';
}

function unpause() {
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'block';
}

function isPaused() {
    return document.getElementById('pauseMenu').style.display == 'block';
}

function reconnect() {
    unpause();
    disconnect();
    setTimeout(() => connect(d.server), 1);
}

function PauseMenu() {
    return (
        <div>
            <button id="pauseButton" onClick={pause} style={{display: "block"}} />
            <div id="pauseMenu" style={{display: "none"}}>
                <center id="pauseMenuContents">
                    <button onClick={unpause}>Resume</button><br />
                    <button onClick={reconnect}>New ship</button><br />
                    <button onClick={disconnect}>Disconnect</button><br />
                    <ColorPicker />
                </center>
            </div>
        </div>
    );
}

export default PauseMenu;

export {
    PauseMenu,
    pause,
    unpause,
    isPaused,
};