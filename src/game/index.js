import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import startGame from './start';

class Game extends React.Component {
    render() {
        return (
            <div>
                <canvas id="mainCanvas" />
                <div id="info">
                    <span id="speedspan"></span><br />
                    <span id="coordinates"></span><br />
                    <span id="playerlist"></span>
                </div>
            </div>
        );
    }

    componentDidMount() {
        startGame();
    }
}

export default Game;