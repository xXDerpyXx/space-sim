import d from '../d';
import { chatIsShown, toggleChat } from './chat/toggle';
import sendChat from './chat/send';
import { isPaused, pause, unpause } from './menu/';
import { handleChange } from './throttle/';

const directions = {
    "ArrowRight": 0,
    "ArrowDown": 90,
    "ArrowLeft": 180,
    "ArrowUp": 270,

    "KeyD": 0,
    "KeyS": 90,
    "KeyA": 180,
    "KeyW": 270,

    "Numpad6": 0,
    "Numpad3": 45,
    "Numpad2": 90,
    "Numpad1": 135,
    "Numpad4": 180,
    "Numpad7": 225,
    "Numpad8": 270,
    "Numpad9": 315,
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

function changeThrottle(up = true) {
    let throttleInput = document.getElementById('throttle');

    let newVal = Number(throttleInput.value) + (Number(throttleInput.step) * ((Number(up) * 2) - 1));
    if (newVal >= Number(throttleInput.min) && newVal <= Number(throttleInput.max)) {
        throttleInput.value = newVal;
        handleChange();
    }
}

function keydown(e) {
    if (document.activeElement.id == "chatInput")
        return;
    
    switch (e.code) {
        case "Minus":
        case "ControlLeft":
        case "ControlRight":
            changeThrottle(false);
            break;

        case "Equal":
        case "ShiftLeft":
        case "ShiftRight":
            changeThrottle(true);
            break;

        case "Space":
            d.socket.emit("nuke");
            break;
    }

    switch (Number(controlMethod.value)) {
        case 0:
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    d.socket.emit("accelerate", true);
                    break;

                case "KeyS":
                case "ArrowDown":
                    d.socket.emit("decelerate", true);
                    break;
                
                case "KeyA":
                case "ArrowLeft":
                    d.socket.emit("rotateleft", true);
                    break;

                case "KeyD":
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

    switch (Number(controlMethod.value)) {
        case 0:
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    d.socket.emit("accelerate", false);
                    break;

                case "KeyS":
                case "ArrowDown":
                    d.socket.emit("decelerate", false);
                    break;
                
                case "KeyA":
                case "ArrowLeft":
                    d.socket.emit("rotateleft", false);
                    break;

                case "KeyD":
                case "ArrowRight":
                    d.socket.emit("rotateright", false);
                    break;
            }
            break;

        case 1:
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

function mousemove(e) {
    if (controlMethod.value == "2") {
        let x = e.x - d.c.width/2;
        let y = e.y - d.c.height/2;
        let angle = Math.atan(y/x) * (180 / Math.PI);
        if (x < 0)
            angle += 180;
        d.socket.emit("setangle", Math.round(angle)+360);
    }
}

function mousedown(e) {
    if (controlMethod.value == "2") {
        d.socket.emit("accelerate", true);
    }
}

function mouseup(e) {
    if (controlMethod.value == "2") {
        d.socket.emit("accelerate", false);
    }
}
        
function resize(e) {
    d.c.width = document.documentElement.clientWidth;
    d.c.height = document.documentElement.clientHeight;
}

var controlMethod;

class Events {
    static register() {
        window.addEventListener("keydown", keydown);
        window.addEventListener("keyup", keyup);
        window.addEventListener("mousemove", mousemove);
        window.addEventListener("mousedown", mousedown);
        window.addEventListener("mouseup", mouseup);
        window.addEventListener("resize", resize);
        
        controlMethod = document.getElementById("controlMethod");
        resize();
    }

    static unregister() {
        window.removeEventListener("keydown", keydown);
        window.removeEventListener("keyup", keyup);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mousedown", mousedown);
        window.removeEventListener("mouseup", mouseup);
    }
}

export default Events;