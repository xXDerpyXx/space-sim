import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import githubIcon from './github.png';
import connect from './connect';
import d from '../d';
import serverList from './serverlist';

function toTime(n) {
    let output = "";
    if (n > 86400)
        output += Math.floor(n / 86400)+":";
    if (n > 3600)
        output += (Math.floor((n / 3600) % 24)).toString().padStart(2, "0")+":";
    output += (Math.floor((n / 60) % 60)).toString().padStart(2, "0")+":"+(n % 60).toString().padStart(2, "0");
    return output;
}

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

async function refresh() {
    await ReactDOM.render(<div />, d.root);
    ReactDOM.render(<ServerBrowser />, d.root);
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
                    <br />
                    <a href="https://github.com/xXDerpyXx/space-sim" >
                        <img className="social-icon" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
                    </a>
                    <a href="https://discord.gg/mU4xTzK" >
                        <img className="social-icon" src="https://discord.com/assets/41484d92c876f76b20c7f746221e8151.svg" height="32" />
                    </a>
                </h1>

                <label>Direct connect:</label>
                <br />
                <input id="toConnect" placeholder="Address" onKeyUp={e => {
                    if (e.key === 'Enter')
                        directConnect();
                }} />
                <button onClick={directConnect}>Connect</button>

                <br />
                <br />

                <label>
                    Official serverlist
                    <button onClick={refresh} style={{fontSize: '18px'}}>⟳</button>
                    :
                </label>
                <table id="serverList">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Players</th>
                            <th>Time left</th>
                            <th>Location</th>
                        </tr>
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
                                <td class="centered">{serverInfo.players}</td>
                                <td class="centered">{serverInfo.timeLeft ? toTime(Math.round(serverInfo.timeLeft / 1000)) : null}</td>
                                <td class="centered">{serverInfo.location}</td>
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