import React from 'react';
import './index.css';
import { getMapCanvas } from './draw';

function Map() {
    return (
        <div id="mapContainer">
            <button id="mapResetButton" onClick={getMapCanvas} />
            <br />
            <canvas id="map" width={150} height={150}></canvas>
        </div>
    );
}

export default Map;