import React from 'react';
import './index.css';
import { getMapCanvas } from './draw';

class Map extends React.Component {
    render() {
        return (
            <div id="mapContainer">
                <div>
                    <button id="mapResetButton" onClick={getMapCanvas} />
                    <br />
                    <canvas id="map" width={150} height={150}></canvas>
                </div>

                <div id="mapDisplayChecks" style={{
                    color: 'lightgrey',
                    opacity: 0.28
                }}>
                    <input type="checkbox" id="showSelf" />
                    <label for="showSelf">Self</label>
                    <br />
                    <input type="checkbox" id="showPlayers" />
                    <label for="showPlayers">Players</label>
                    <br />
                    <input type="checkbox" id="showStars" />
                    <label for="showStars">Stars</label>
                    <br />
                    <input type="checkbox" id="showPlanets" />
                    <label for="showPlanets">Planets</label>
                </div>
            </div>
        );
    }

    componentDidMount() {
        for (let i of ['showSelf', 'showPlayers', 'showStars'])
            document.getElementById(i).checked = true;
    }
}

export default Map;