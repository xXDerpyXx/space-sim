import socketIOClient from "socket.io-client";

var socket = socketIOClient("http://localhost:3979", {transports: [ 'websocket']});

export default socket;