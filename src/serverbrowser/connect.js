import React from 'react';
import ReactDOM from 'react-dom';
import socketIOClient from "socket.io-client";
import Game from '../game';
import d from '../d';

function connect(server) {
    d.socket = socketIOClient(`ws${server.secure ? "s" : ""}://${server.url}`, {transports: ['websocket']});
    d.server = server;
    // on reconnection, reset the transports option, as the Websocket connection may have failed (caused by proxy, firewall, browser, ...)
    d.socket.on('reconnect_attempt', () => {
        d.socket.io.opts.transports = ['polling', 'websocket'];
    });
    ReactDOM.render(<Game />, d.root);
}

export default connect;