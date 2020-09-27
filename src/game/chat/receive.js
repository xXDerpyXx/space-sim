import React from 'react';
import { renderToString } from 'react-dom/server';
import { Chat, Message } from './index';
import d from '../../d';
import { chatIsShown } from './toggle';

function receiveMessages() {
    d.socket.on("message", (player, content) => {
        let chatDiv = document.getElementById('chatMessages')
        chatDiv.innerHTML += renderToString(
            <Message player={player}>
                {content}
            </Message>
        );
        let children = document.getElementById('chatMessages').children;
        let lastMessage = children[children.length - 1];
        let scrollTopMax = chatDiv.scrollHeight - chatDiv.clientHeight - chatDiv.clientTop;
        if (scrollTopMax - chatDiv.scrollTop < lastMessage.clientHeight + 5) {
            chatDiv.scrollTop = scrollTopMax;
        }
    });
}

export default receiveMessages;