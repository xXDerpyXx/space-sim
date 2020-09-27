import d from '../../d';

function sendChat() {
    let chatInput = document.getElementById("chatInput");
    if (chatInput.value == "")
        return;
    d.socket.emit("sendMessage", chatInput.value);
    chatInput.value = "";
}

export default sendChat;