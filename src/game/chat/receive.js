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
        if (chatDiv.scrollTopMax - chatDiv.scrollTop < 20) {
            chatDiv.scrollTop = chatDiv.scrollTopMax;
        }
    });
}

export default receiveMessages;