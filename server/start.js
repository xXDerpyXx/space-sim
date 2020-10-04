const bodyCount = 10*10;
const universeSize = 20000;

module.exports = function start() {
    var Body = require('./classes/body');
    var v = require('./v');

    v.io.emit('kick', 'This server\'s being restarted! Try to reconnect to it in a few seconds.'); //tell every client that the server's about to be restarted.
    for (let socket of Object.values(v.io.of('/').connected)) //for every client connected to the servers,
        socket.disconnect(true); //disconnect it.

    v.userTotal = 0; //since the server is just starting, no one will be connected. set userTotal to 0 so that the number of people connected to the server can be counted.
    v.startDate = Date.now(); //save the time of when this game was started.

    v.bodies = []; //make a new empty array where all the bodies will go
    v.players = [];

    for (let i = 0; i < bodyCount; i++) {
        let newBody = new Body((Math.random()*universeSize*2)-universeSize,(Math.random()*universeSize*2)-universeSize);
        newBody.xVel = (Math.random()*0.5)-0.25;
        newBody.yVel = (Math.random()*0.5)-0.25;
        newBody.size = Math.sqrt((newBody.mass/newBody.density)/Math.PI)
        newBody.mass = (Math.random() > 0.95 ? (Math.random()*10000)+1200 : (Math.random()*900)+50);
        v.bodies.push(newBody);
    }
}