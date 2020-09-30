import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import startGame from './start';
import PauseMenu from './menu/';
import Throttle from './throttle/';
import Map from './map/';
import { getMapCanvas } from './map/draw';
import Chat from './chat/';

class Game extends React.Component {
    render() {
        return (
            <div>
                <canvas id="mainCanvas" />
                <div id="info">
                    velocity: <span id="speedspan"></span>km/s<br />
                    x: <span id="xcoord"></span> y: <span id="ycoord"></span><br />
                    players online: <span id="playersOnline"></span>
                </div>
                <PauseMenu />
                <Throttle />
                <Map />
                <Chat />
            </div>
        );
    }

    componentDidMount() {
        getMapCanvas();
        startGame();
    }
}

export default Game;