import React from 'react';
import './shipSVG.css'

const shipScale = 1.6;
const SVGScale = 2;
const SVGSize = 16;

let shipPath = [
    [0, -2],
    [-3, -4],
    [0, 4],
    [3, -4],
];

let addX = 3 + (2 / SVGScale);
let addY = 4;


let shipPath2D = new Path2D();
for (let i in shipPath) {
    let pos = shipPath[i]
    shipPath2D[i==0 ? 'moveTo' : 'lineTo'](pos[0]*shipScale, pos[1]*shipScale);
}
shipPath2D.closePath();


function ShipSVG(props) {
    let SVGData = "";
    for (let i in shipPath) {
        let pos = shipPath[i];
        SVGData += `${(i==0 ? 'M' : 'L')}${(pos[0]+addX)*SVGScale} ${(pos[1]+addY)*SVGScale} `;
    }
    SVGData += "Z";

    return (
        <svg className={`player-icon-${props.type}`} height={SVGSize} width={SVGSize} transform={`rotate(${props.direction - 90})`}>
            <path d={SVGData} fill={props.color} />
        </svg>
    );
}


export {
    shipPath2D,
    ShipSVG
};