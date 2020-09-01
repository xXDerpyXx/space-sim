import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import startGame from './start';
import PauseMenu from './menu/index'
import Chat from './chat/'

class Game extends React.Component {
    render() {
        return (
            <div>
                <canvas id="mainCanvas" />
                <div id="info">
                    ping: <span id="ping">(pinging...)</span>ms<br />
                    velocity: <span id="speedspan"></span>km/s<br />
                    x: <span id="xcoord"></span> y: <span id="ycoord"></span><br />
                    <span id="playerlist"></span>
                </div>
                <PauseMenu />
                <Chat />
            </div>
        );
    }

    componentDidMount() {
        startGame();
    }
}

export default Game;