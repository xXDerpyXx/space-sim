import React from 'react';
import './index.css';
import d from '../../d';
import { toggleChat, chatButtonText } from './toggle';
import send from './send';
import { ShipSVG } from '../renderer/shipPath';

function Message(props) {
    return(
        <div className="chat-message">
            <ShipSVG color={props.player.color} direction={props.player.direction} />
            {/*<svg className="player-icon" height={16} width={16}>
                <circle cx={8} cy={8} r={8} fill={props.player.color} />
            </svg>*/}
            <span className="chat-message-text">{props.children}</span>
        </div>
    );
}

class Chat extends React.Component {
    state = {
        messages: [],
    }

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