import React, { useEffect, useState } from 'react';
import GaugeChart from 'react-gauge-chart';
import './index.css';
import d from '../../d';
const decimalsShown = 1;

function FuelGauge() {
    const [currentPercent, setCurrentPercent] = useState();
    const [arcs, setArcs] = useState([]); //this breaks on resize without this (part 1)

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPercent(d.fuel.current / d.fuel.max);
            setArcs([]); //this breaks on resize without this (part 2)
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    });

    return (
        <GaugeChart
            id="fuelGauge"
            style={{width: 250}}
            nrOfLevels={35}
            percent={0}
            colors={[
                "#c92e2e",
                "#8ce329"
            ]}
            percent={currentPercent}
            animDelay={0}
            formatTextValue={val => {return `${val.toFixed(decimalsShown)}%`}}
        />
    );
}

export default FuelGauge;