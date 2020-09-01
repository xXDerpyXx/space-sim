import d from '../d';
import { chatIsShown, toggleChat } from './chat/toggle';
import sendChat from './chat/send';
import { isPaused, pause, unpause } from './menu/';

var directions = {
    "ArrowUp": 3,
    "ArrowRight": 0,
    "ArrowDown": 2,
    "ArrowLeft": 1,
}

function keydown(e) {
    if (document.activeElement.id == "chatInput")
        return;
    if (e.code == "Space") {
        d.socket.emit("nuke");
    } else if (directions.hasOwnProperty(e.code)) {
        e.preventDefault();
        d.socket.emit("dir", directions[e.code], true)
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
        
        default:
            if (directions.hasOwnProperty(e.code)) {
                e.preventDefault();
                d.socket.emit("dir", directions[e.code], false)
            }
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