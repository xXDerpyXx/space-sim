import React from 'react';
import ReactDOM from 'react-dom';
import ServerBrowser from '../serverbrowser';
import d from '../d';
import Events from './events';

function disconnect(alertMessage) {
    if (d.socket == null)
        return;
    Events.unregister();
    d.socket.removeAllListeners();
    d.socket.close();
    d.socket = null;
    clearInterval(d.intervals.colliding);
    clearInterval(d.intervals.draw);
    ReactDOM.render(<ServerBrowser />, d.root);
    if (alertMessage != null)
        alert(alertMessage);
}

export default disconnect;