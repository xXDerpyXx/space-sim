import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from "socket.io-client";
import Game from '../game';
import startGame from '../game/start';
import d from '../d';
import ServerBrowser from '.';

function connect(url) {
    d.socket = socketIOClient("http://"+url, {transports: [ 'websocket']});
    ReactDOM.render(<Game />, d.root);
}

export default connect;