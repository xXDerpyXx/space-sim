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
    document.getElementById("openChatButtonText").innerHTML = chatButtonText[(shown ? "open" : "close")];
    document.getElementById('openChatButton').style.background = ''; //reset the background of the open chat button (because it will turn red when a new chat is posted and the chat is closed)
};

export {
    toggleChat,
    chatIsShown,
    chatButtonText
};