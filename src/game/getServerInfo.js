import d from '../d';

function getServerInfo() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            let serverInfo = JSON.parse(xmlHttp.responseText);

            d.fuel.max = serverInfo.fuelMax;
        }
    }
    xmlHttp.open("GET", `http${d.server.secure ? 's' : ''}://${d.server.url}/detailedinfo`, true);
    xmlHttp.send(null);
}

export default getServerInfo;