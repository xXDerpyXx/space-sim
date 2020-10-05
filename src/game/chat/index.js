import React from 'react';
import './index.css';
import d from '../../d';
import { toggleChat, chatButtonText } from './toggle';
import send from './send';
import { ShipSVG } from '../renderer/shipPath';

const chatColors = {
    chat: '#ffffff',
    action: '#f9ff47',
};

function Message(props) {
    return(
        <div className="chat-message" style={{color: chatColors[props.message.type]}}>
            {props.message.sender ? <ShipSVG type="sender" color={props.message.sender.color} direction={props.message.sender.direction} /> : null}
            {props.message.content ? <span>{props.message.content}</span> : null}
            {props.message.receiver ? <ShipSVG type="receiver" color={props.message.receiver.color} direction={props.message.receiver.direction} /> : null}
            {props.message.append ? <span>{props.message.append}</span> : null}
        </div>
    );
}

class Chat extends React.Component {
    state = {
        messages: [],
    };

    render() {
        return (
            <div id="chat">
                <button id="openChatButton" onClick={toggleChat}>
                    <span id="openChatButtonText">{chatButtonText.open}</span>
                    (<span id="messagesSentNum">0</span>)
                </button>
                <div id="chatBox">
                    <div id="chatMessages">
                        {this.state.messages}
                        {/*<Message player={{colour: "#654321"}}>
                            whoaaa!!!
                        </Message>
                        <div className="chat-message">
                            <svg className="player-icon" height={16} width={16}>
                                <circle cx={8} cy={8} r={8} fill="#123456" />
                            </svg>
                            <span className="chat-message-text">hi im chatting lol</span>
                        </div>
                        <div className="chat-message">
                            <svg className="player-icon" height={16} width={16}>
                                <circle cx={8} cy={8} r={8} fill="#123456" />
                            </svg>
                            <span className="chat-message-text">hi im chatting lol</span>
                        </div>
                        <div className="chat-message">
                            <svg className="player-icon" height={16} width={16}>
                                <circle cx={8} cy={8} r={8} fill="#123456" />
                            </svg>
                            <span className="chat-message-text">hi im chatting lol</span>
                        </div>*/}
                    </div>
                    <div id="sendChat">
                        <input id="chatInput" maxLength={100} />
                        <button onClick={send}>Send</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;

export {
    Chat,
    Message,
};