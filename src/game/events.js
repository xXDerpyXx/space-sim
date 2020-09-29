import d from '../d';
import { chatIsShown, toggleChat } from './chat/toggle';
import sendChat from './chat/send';
import { isPaused, pause, unpause } from './menu/';

function keydown(e) {
    if (document.activeElement.id == "chatInput")
        return;
    switch (e.code) {
        case "Space":
            d.socket.emit("nuke");
            break;
        
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