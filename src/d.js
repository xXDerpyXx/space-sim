import React from 'react';
import ReactDOM from 'react-dom';

var d = {
    intervals: {},
    socket: null,
    server: null,
    root: document.getElementById('root'),
    fuel: {
        current: 1,
        max: 1,
    }
};

export default d;