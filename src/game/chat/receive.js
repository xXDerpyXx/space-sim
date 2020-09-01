import React from 'react';
import { renderToString } from 'react-dom/server';
import { Chat, Message } from './index';
import d from '../../d';
import { chatIsShown } from './toggle';

function receiveMessages() {
    d.socket.on("message", (player, content) => {
        console.log(player, content);
        document.getElementById('chatMessages').innerHTML += renderToString(
            <Message player={player}>
                {content}
            </Message>
        );
    });
}

export default receiveMessages;