const planetDisplayMin = 500;
const playerWidth = 4;
const selfWidth = 5;
const starWidth = 4;

var canvas, ctx, middleX, middleY, scale, pos;

var mouseDown = false;
var lastPos = null;


function getMapCanvas() {
    canvas = document.getElementById('map');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('wheel', zoom);
    canvas.addEventListener('mousemove', drag);
    canvas.addEventListener('mousedown', () => mouseDown = true);
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
        lastPos = null;
    });
    
    middleX = canvas.width/2;
    middleY = canvas.height/2;
    scale = 100;
    pos = {
        x: 0,
        y: 0
    }
}

function zoom(event) {
    let scrollAmount = 3;
    if (event.deltaY < 0)
        scrollAmount *= -1;
    let zoomAmount = 1 + (scrollAmount / 100);
    if (scale * zoomAmount > 0) {
        scale *= zoomAmount;
        pos.x /= zoomAmount;
        pos.y /= zoomAmount;
    }
}

function drag(event) {
    if (mouseDown) {
        let currentPos = {
            x: event.layerX,
            y: event.layerY
        }
        if (lastPos != null) {
            for (let i of ['x', 'y']) {
                pos[i] += (currentPos[i] - lastPos[i]);
            }
            //console.log(pos)
        }
        lastPos = currentPos;
    }
}

function drawDot(x, y, size) {
    let offset = size/2;
    ctx.fillRect(x - offset + pos.x, y - offset + pos.y, size, size)

}

function drawMap(bodies, center) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear the canvas
    if (!bodies[center]) return; //skip drawing the map this frame if the client's ship can't be found
    let me = bodies[center];

    for (let body of bodies) {
        let isStar = body.mass > planetDisplayMin;
        if (isStar || body.shipId) {
            ctx.fillStyle = body.color;
            var tWidth = 0;
            if(isStar){
                tWidth = (Math.round(Math.sqrt(body.mass)/20)) * (100/scale);
            }
            let distanceX = (body.x - me.x) / scale;
            let distanceY = (body.y - me.y) / scale;
            drawDot(middleX + distanceX, middleY + distanceY, isStar ? tWidth : playerWidth)
        }
    }
    //draw the center dot (this client's ship)
    ctx.fillStyle = me.color;
    drawDot(middleX, middleY, selfWidth);
}

export {
    getMapCanvas,
    drawMap
};