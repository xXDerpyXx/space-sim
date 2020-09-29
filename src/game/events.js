import d from '../d';
import { chatIsShown, toggleChat } from './chat/toggle';
import sendChat from './chat/send';
import { isPaused, pause, unpause } from './menu/';

const directions = {
    "ArrowRight": 0,
    "ArrowDown": 90,
    "ArrowLeft": 180,
    "ArrowUp": 270,
};

var keysDown = [];

function sum(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i];
    return s;
} 
 
function degToRad(a) {
    return Math.PI / 180 * a;
}

function redirect() {
    if (keysDown.length > 0) {
        let angles = [];
        for (let i of keysDown)
            angles.push(directions[i]);
        let angle = 180 / Math.PI * Math.atan2(
            sum(angles.map(degToRad).map(Math.sin)) / angles.length,
            sum(angles.map(degToRad).map(Math.cos)) / angles.length
        );
        while (angle < 360) angle += 360;
        d.socket.emit("setangle", angle);
    }
}

function keydown(e) {
    if (document.activeElement.id == "chatInput")
        return;
    switch (e.code) {
        case "Space":
            d.socket.emit("nuke");
            break;
    }

    switch (Number(document.getElementById("controlMethod").value)) {
        case 0:
            switch (e.code) {
                case "ArrowUp":
                    d.socket.emit("accelerate", true);
                    break;

                case "ArrowDown":
                    d.socket.emit("decelerate", true);
                    break;
                
                case "ArrowLeft":
                    d.socket.emit("rotateleft", true);
                    break;

                case "ArrowRight":
                    d.socket.emit("rotateright", true);
                    break;
            }
            break;

        case 1:
            if (directions.hasOwnProperty(e.code)) {
                if (keysDown.indexOf(e.code) == -1)
                    keysDown.push(e.code);
                redirect();
                if (keysDown.length == 1)
                    d.socket.emit("accelerate", true);
            }
            break;
    }
}

function keyup(e) {
    switch (e.code) {
        case "KeyT":
            if (!chatIsShown())
                toggleChat();
            if (document.activeElement.id != "chatInput")
                document.getElementById("chatInput").focus();
            break;
        
        case "Enter":
            if (document.activeElement.id == "chatInput")
                sendChat();
            break;
        
        case "Escape":
            if (document.activeElement.id == "chatInput" && chatIsShown())
                toggleChat();
            else
                isPaused() ? unpause() : pause();
            break;
    }

    switch (Number(document.getElementById("controlMethod").value)) {
        case 0:
            switch (e.code) {
                case "ArrowUp":
                    d.socket.emit("accelerate", false);
                    break;

                case "ArrowDown":
                    d.socket.emit("decelerate", false);
                    break;
                
                case "ArrowLeft":
                    d.socket.emit("rotateleft", false);
                    break;

                case "ArrowRight":
                    d.socket.emit("rotateright", false);
                    break;
            }
            break;

        case 1:
            console.log(":)")
            if (directions.hasOwnProperty(e.code)) {
                if (keysDown.indexOf(e.code) != -1)
                    keysDown.splice(keysDown.indexOf(e.code), 1);
                redirect();
                if (keysDown.length == 0)
                    d.socket.emit("accelerate", false);
            }
            break;

    }
}
        
function resize(e) {
    d.c.width = document.documentElement.clientWidth;
    d.c.height = document.documentElement.clientHeight;
}

class Events {
    static register() {
        window.addEventListener("keydown", keydown);
        window.addEventListener("keyup", keyup);
        resize();
        window.addEventListener("resize", resize);
    }

    static unregister() {
        window.removeEventListener("keydown", keydown);
        window.removeEventListener("keyup", keyup);
        window.removeEventListener("resize", resize);
    }
}

export default Events;