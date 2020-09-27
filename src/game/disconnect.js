import React from 'react';
import ReactDOM from 'react-dom';
import ServerBrowser from '../serverbrowser';
import d from '../d';
import Events from './events';

function disconnect() {
    if (d.socket == null)
        return;
    Events.unregister();
    d.socket.removeAllListeners();
    d.socket.close();
    d.socket = null;
    clearInterval(d.intervals.colliding);
    clearInterval(d.intervals.draw);
    ReactDOM.render(ServerBrowser(), d.root);
}

export default disconnect;