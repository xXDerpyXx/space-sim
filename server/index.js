const v = require('./v');
const cfg = require('./cfg');
var startDate = Date.now();

//preparing globals
var val = "";

const rotationSpeed = 15;
const hyperjumpBoost = 250; //the distance of a hyperjump
const hyperjumpCooldown = 1000; //how long you have to wait between hyperjumps in ms

v.app = v.m.express();

var server = v.app.listen(cfg.port);
v.io = require('socket.io').listen(server,{pingTimeout: 30000, pingInterval: 100});
v.io.set('heartbeat timeout', 30000);
v.io.set('heartbeat interval', 4);



v.app.use(require('cors')()); //allow cross-origin resource sharing for all routes
v.app.use(require('./serverinfo')); //import routes which show info about the server
v.app.use(v.m.express.static(v.m.path.join(__dirname, 'public'))); //serve all files from the 'server/public' directory

function getPlayerBody(socket) {
	return v.bodies.find(body => body.shipId == socket.id);
}

const Player = require('./classes/player');
const Body = require('./classes/body');
v.io.on('connection', function(socket) {
	if (v.userTotal >= cfg.playerLimit) {
		socket.emit('kick', 'This server is full!');
		socket.disconnect(true);
		return;
	}
	v.userTotal += 1;
	socket.emit('newVal',val);
	socket.emit("resetplayers");
	console.log(`a user connected. user count: ${v.userTotal}`);
	v.bodies.filter(e => e.shipId == socket.id).forEach(e => e.delete = true); //delete any bodies which have the same socket id as the connecting player
	v.players[socket.id] = new Player(socket.id);
	var temp = new Body(Math.random()*20,Math.random()*20);
	temp.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
	temp.mass = 2;
	temp.shipId = socket.id;
	temp.invincible = true;
	temp.density = 1;
	v.bodies.push(temp)
	v.players[socket.id].ship = v.bodies.length-1
	//socket.emit('getNum',Math.floor((Math.random()*100)+1));
	socket.on('disconnect', function() {
		v.userTotal -= 1;
		console.log(`a user disconnected. user count: ${v.userTotal}`);
		for (let i in v.bodies)
			if (v.bodies[i].shipId == socket.id)
				v.players[socket.id].ship = i;
		v.bodies.splice(v.players[socket.id].ship,1)
		v.players.splice(parseInt(socket.id),1);

		socket.broadcast.emit("delete",socket.id);
	});

	socket.on("throttle", power => {
		power = Number(power);
		if (isNaN(power) || power < 0 || power > 1)
			return;
		v.players[socket.id].throttle = power;
	});


	socket.on("accelerate", stop => {
		v.players[socket.id].accelerating = Boolean(stop);
	});

	socket.on("decelerate", stop => {
		v.players[socket.id].decelerating = Boolean(stop);
	});

	socket.on("rotateleft", stop => {
		v.players[socket.id].rotatingLeft = Boolean(stop);
	});

	socket.on("rotateright", stop => {
		v.players[socket.id].rotatingRight = Boolean(stop);
	});

	socket.on("setangle", angle => {
		if (typeof angle == "number" && angle >= 0)
			getPlayerBody(socket).angle = angle % 360;
	});

	socket.on("hyperjump", () => {
		let player = v.players[socket.id];
		let time = Date.now();
		if (player.lastJump + hyperjumpCooldown < time) {
			let ship = getPlayerBody(socket);
			ship.x += Math.cos(ship.angle * Math.PI / 180) * hyperjumpBoost;
			ship.y += Math.sin(ship.angle * Math.PI / 180) * hyperjumpBoost;
			player.lastJump = time;
		}
	});

	socket.on("nuke",function() {
		let ship = getPlayerBody(socket);

		var nuke = new Body(ship.x,ship.y);
		nuke.nuke = true;
		nuke.xVel = ship.xVel;
		nuke.yVel = ship.yVel;
		nuke.mass = 10;
		nuke.color = "#FFFF00";
		//v.bodies.push(nuke);
		return;
	});

	socket.on("newShip",function() {
		getPlayerBody(socket).delete = true;
		var temp = new Body(0,0);
		temp.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
		temp.mass = 2;
		temp.shipId = socket.id;
		temp.density = 1;
		v.bodies.push(temp)
		v.players[socket.id].ship = v.bodies.length-1
	});

	socket.on("sendMessage", content => {
		if (typeof content != "string" || content.length > 100)
			return;
		let userBody = getPlayerBody(socket);
		v.io.emit("message", {
			color: userBody.color,
			direction: userBody.angle
		}, content);
	});

	socket.on("changeColor", hex => {
		if (typeof hex != "string")
			return;
		color = hex.match(/^#([0-9a-f]{6})$/i)[1];
		if (color) {
			let vals = [];
			for (let i = 0; i < 6; i += 2)
				vals.push(parseInt(color.substr(i, 2), 16));
			getPlayerBody(socket).color = `rgb(${vals.join(",")})`;
		}
	})
});


setInterval(function() {
	for (let body of v.bodies)
		if (body.shipId != null) {
			var player = v.players[body.shipId];
			//v.io.to(id).emit("center",i);
			var speed = 0.1;
			var walkspeed = 3.2;

			let xVel = Math.cos(body.angle * Math.PI / 180);
			let yVel = Math.sin(body.angle * Math.PI / 180);
			body.xVel += xVel * player.acceleration;
			body.yVel += yVel * player.acceleration;

			if (player.accelerating || player.decelerating) {
				let moving = Number(player.accelerating) + -Number(player.decelerating); //will return +1 if accelerating, -1 if decelerating, 0 if both
				player.acceleration = (speed * player.throttle) * moving;

				if (body.colliding) {
					let xWalk = xVel*walkspeed*(player.acceleration/speed);
					let yWalk = yVel*walkspeed*(player.acceleration/speed);
					body.x+=xWalk;
					body.y+=yWalk;
					body.xVel+=xWalk;
					body.yVel+=yWalk;
				}
			} else
				player.acceleration = 0;
			if (player.rotatingLeft || player.rotatingRight) {
				body.angle += rotationSpeed * (Number(player.rotatingRight) + -Number(player.rotatingLeft));
				body.angle += 360; //make sure the direction is positive
				body.angle %= 360; //if the direction is now more than 360, correct that
			}
		}


},50);

setInterval(function() {
	v.io.emit("bodyupdate",JSON.stringify(v.bodies));
},50);

setInterval(function() {
    for (let body of v.bodies) {
        body.update();
        body.move();
	}
	
    for (let i in v.bodies)
        if (v.bodies[i].delete)
            v.bodies.splice(i,1);
},1);

setInterval(v.fn.start, v.cfg.gameLength * 1000 || 60 * 60 * 1000);

v.fn.start();

console.log(`Server up on port ${cfg.port}!`);