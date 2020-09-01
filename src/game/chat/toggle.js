const chatButtonText = {
    open: "+Chat",
    close: "-Chat",
};

function chatIsShown() {
    return document.getElementById("chatBox").style.display == "block";
}

function toggleChat() {
    let shown = chatIsShown();
    document.getElementById("chatBox").style.display = (shown ? "none" : "block");
    document.getElementById("openChatButton").innerHTML = chatButtonText[(shown ? "open" : "close")]
};

export {
    toggleChat,
    chatIsShown,
    chatButtonText
};