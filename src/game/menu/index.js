import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import disconnect from '../disconnect';
import d from '../../d'

function pause() {
    document.getElementById('pauseMenu').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'none';

}

function unpause() {
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'block';
}

function PauseMenu() {
    return (
        <div>
            <button id="pauseButton" onClick={pause} style={{display: "block"}} />
            <div id="pauseMenu" style={{display: "none"}}>
                <div id="pauseMenuContents">
                    <button onClick={unpause}>Resume</button><br />
                    <button onClick={disconnect}>Disconnect</button>
                </div>
            </div>
        </div>
    );
}

export default PauseMenu;