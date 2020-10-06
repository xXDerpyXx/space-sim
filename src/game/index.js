import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import JoyWrapper from './joystick/';
import PauseMenu from './menu/';
import Throttle from './throttle/';
import FuelGauge from './fuelGauge/';
import Map from './map/';
import { getMapCanvas } from './map/draw';
import startGame from './renderer/';
import getServerInfo from './getServerInfo';
import Chat from './chat/';

class Game extends React.Component {
    render() {
        return (
            <div>
                <canvas id="mainCanvas" />
                <div id="info">
                    velocity: <span id="speedspan"></span>km/s<br />
                    x: <span id="xcoord"></span> y: <span id="ycoord"></span>
                </div>
                <JoyWrapper />
                <PauseMenu />
                <Throttle />
                <FuelGauge />
                <Map />
                <Chat />
            </div>
        );
    }

    componentDidMount() {
        getMapCanvas();
        getServerInfo();
        startGame();
    }
}

export default Game;