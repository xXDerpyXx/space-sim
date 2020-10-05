import React from 'react';
import { renderToString } from 'react-dom/server';
import { Chat, Message } from './index';
import d from '../../d';
import { chatIsShown } from './toggle';

function receiveMessages() {
    d.socket.on("message", message => {
        let chatDiv = document.getElementById('chatMessages')
        chatDiv.innerHTML += renderToString(<Message message={message} />);
        let children = document.getElementById('chatMessages').children;
        let lastMessage = children[children.length - 1];
        let scrollTopMax = chatDiv.scrollHeight - chatDiv.clientHeight - chatDiv.clientTop;
        if (scrollTopMax - chatDiv.scrollTop < lastMessage.clientHeight + 5) {
            chatDiv.scrollTop = scrollTopMax;
        }
        document.getElementById('messagesSentNum').innerHTML = children.length; //display the amount of messages sent on the open chat button

        if (!chatIsShown()) //if the chat box is not open (and therefore the user is not aware that a new message has been posted)
            document.getElementById('openChatButton').style.background = '#f56262'; //change the colour of the open chat button, to make it more obvious to the user that a message has been sent.
    });
}

export default receiveMessages;