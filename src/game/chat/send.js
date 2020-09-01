import d from '../../d';

function sendChat() {
    let chatInput = document.getElementById("chatInput");
    d.socket.emit("sendMessage", chatInput.value);
    chatInput.value = "";
}

export default sendChat;