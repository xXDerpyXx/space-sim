import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import connect from './connect';
import d from '../d';
import serverList from './serverlist';

function directConnect() {
    let address = document.getElementById('toConnect').value;
    let server = {
        url: address,
        secure: false,
    };
    if (address.startsWith('http://')) {
        server.url = address.slice('http://'.length);
    } else if (address.startsWith('https://')) {
        server.url = address.slice('https://'.length);
        server.secure = true;
    }
    connect(server);
}

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
            <br />
            <label>Direct connect:</label>
            <br />
            <input id="toConnect" placeholder="IP/Address" onKeyUp={e => {
                if (e.key === 'Enter')
                    directConnect();
            }} />
            <button onClick={directConnect}>Connect</button>
        </div>
    );
}

export default ServerBrowser;