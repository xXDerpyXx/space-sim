import React from 'react';
import ReactDOM from 'react-dom';
import ServerBrowser from '../serverbrowser';
import d from '../d';

function disconnect() {
    clearInterval(d.intervals.colliding);
    clearInterval(d.intervals.draw);
    ReactDOM.render(ServerBrowser(), d.root);
}

export default disconnect;