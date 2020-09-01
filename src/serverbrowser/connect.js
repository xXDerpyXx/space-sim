import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from "socket.io-client";
import Game from '../game';
import d from '../d';

function connect(url) {
    d.socket = socketIOClient("http://"+url, {transports: [ 'websocket']});
    ReactDOM.render(<Game />, d.root);
}

export default connect;