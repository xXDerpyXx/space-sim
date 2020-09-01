import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import connect from './connect';
import d from '../d';
import serverList from './serverlist';

function ServerBrowser() {
    if (d.socket != null) {
        d.socket.close();
        d.socket = null;
    }
    
    let servers = [];
    let secure = window.location.protocol == "https:";
    for (let server of serverList) {
        if (secure && !server.secure)
            continue;
        servers.push(
            <div>
                <button onClick={() => connect(server)}>{server.url}</button>
            </div>
        );
    }

    return (
        <div>
            {servers}
        </div>
    );
}

export default ServerBrowser;