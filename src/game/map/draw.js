var canvas, ctx, middleX, middleY;

const planetDisplayMin = 500;
var scale = 100;

const playerWidth = 2;
const selfWidth = 3;
const starWidth = 4;

function zoom(event) {
    console.log(event)
    if (scale + event.deltaY > 0)
        scale += event.deltaY;
}

function getMapCanvas() {
    let firstLoad = canvas == undefined;
    canvas = document.getElementById('map');
    if (firstLoad)
        canvas.addEventListener('wheel', zoom);
    ctx = canvas.getContext('2d');
    middleX = canvas.width/2;
    middleY = canvas.height/2;
}

function drawDot(x, y, size) {
    let offset = size/2;
    ctx.fillRect(x - offset, y - offset, size, size)

}

function drawMap(bodies, center) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear the canvas
    if (!bodies[center]) return; //skip drawing the map this frame if the client's ship can't be found
    let me = bodies[center];

    for (let body of bodies) {
        let isStar = body.mass > planetDisplayMin;
        if (isStar || body.shipId) {
            ctx.fillStyle = body.color;
            let offsetX = (body.x - me.x) / scale;
            let offsetY = (body.y - me.y) / scale;
            drawDot(middleX + offsetX, middleY + offsetY, isStar ? starWidth : playerWidth)
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