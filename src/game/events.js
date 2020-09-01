import d from '../d';

var directions = {
    "ArrowUp": 3,
    "ArrowRight": 0,
    "ArrowDown": 2,
    "ArrowLeft": 1,
}

function startMoving(e) {
    var launchVel = 1;
    if(e.code == "Space"){
        d.socket.emit("nuke");
    }
    if (directions.hasOwnProperty(e.code)) {
        e.preventDefault();
        d.socket.emit("dir", directions[e.code], true)
    }

}

function stopMoving(e) {
    if (directions.hasOwnProperty(e.code)) {
        e.preventDefault();
        d.socket.emit("dir", directions[e.code], false)
    }
}
        
function resize(e) {
    d.c.width = document.documentElement.clientWidth;
    d.c.height = document.documentElement.clientHeight;
}

class Events {
    static register() {
        window.addEventListener("keydown", startMoving);
        window.addEventListener("keyup", stopMoving);
        resize();
        window.addEventListener("resize", resize);
    }

    static unregister() {
        window.removeEventListener("keydown", startMoving);
        window.removeEventListener("keyup", stopMoving);
        window.removeEventListener("resize", resize);
    }
}

export default Events;