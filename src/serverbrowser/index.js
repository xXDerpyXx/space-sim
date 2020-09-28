import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import githubIcon from './github.png';
import connect from './connect';
import d from '../d';
import serverList from './serverlist';

function directConnect() {
    let address = document.getElementById('toConnect').value;
    while (address[address.length - 1] == '/')
        address = address.slice(0, -1);
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

class ServerBrowser extends React.Component {
    constructor(props) {
        super(props); 
        this.state = {
            servers: []
        };
    }

    render() {
        if (d.socket != null) {
            d.socket.close();
            d.socket = null;
        }

        return (
            <div>
                <h1>
                    space-sim
                    <a href="https://github.com/xXDerpyXx/space-sim" id="githubLogo">
                        <img src={githubIcon} />
                    </a>
                </h1>

                <label>Direct connect:</label>
                <br />
                <input id="toConnect" placeholder="IP/Address" onKeyUp={e => {
                    if (e.key === 'Enter')
                        directConnect();
                }} />
                <button onClick={directConnect}>Connect</button>

                <br />
                <br />

                <label>Official serverlist:</label>
                <table id="serverList">
                    <thead>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Players</th>
                        <th>Uptime</th>
                        <th>Location</th>
                    </thead>

                    <tbody>
                        {this.state.servers}
                    </tbody>
                </table>

                <br />
                
            </div>
        );
    }

    componentDidMount() {
        let serverListComponent = this;
        let servers = [];
        let secure = window.location.protocol == "https:";
        for (let server of serverList) {
            if (secure && !server.secure)
                continue;

            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() { 
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    let serverInfo = JSON.parse(xmlHttp.responseText);

                    serverListComponent.setState(prevState => ({
                        servers: [...prevState.servers, (
                            <tr key={prevState.servers.length} onClick={() => connect(server)}>
                                <td>{serverInfo.name}</td>
                                <td>{server.url}</td>
                                <td>{serverInfo.players}</td>
                                <td>{serverInfo.uptime ? serverInfo.uptime : null}</td>
                                <td>{serverInfo.location}</td>
                                {/*<td><button className="connectButton" onClick={() => connect(server)}>Connect</button></td>*/}
                            </tr>
                        )]
                    }));
                }
            }
            xmlHttp.open("GET", `http${server.secure ? 's' : ''}://${server.url}/basicinfo`, true);
            xmlHttp.send(null);
        }
    }
}

export default ServerBrowser;