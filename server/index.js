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
v.io.on('connection', function(socket){
	if (v.userTotal >= cfg.playerLimit) {
		socket.emit('kick', 'This server is full!');
		socket.disconnect(true);
		return;
	}
	v.userTotal += 1;
	socket.emit('newVal',val);
	socket.emit("resetplayers");
	console.log('a user connected');
	console.log('user count: '+v.userTotal);
	for(var i = 0; i < v.bodies.length; i++){
		if(v.bodies[i].shipId == socket.id){
			v.bodies[i].delete = true;
		}
	}
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
	socket.on('disconnect', function(){
		v.userTotal -= 1;
		console.log('a user disconnected');
		console.log('user count: '+v.userTotal);
		for(var i = 0; i < v.bodies.length; i++){
			if(v.bodies[i].shipId == socket.id){
				v.players[socket.id].ship = i;
			}
		}
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

	socket.on("nuke",function(){
		for(var i = 0; i < v.bodies.length; i++){
			if(v.bodies[i].shipId == socket.id){
				var nuke = new Body(v.bodies[i].x,v.bodies[i].y);
				nuke.nuke = true;
				nuke.xVel = v.bodies[i].xVel;
				nuke.yVel = v.bodies[i].yVel;
				nuke.mass = 10;
				nuke.color = "#FFFF00";
				//v.bodies.push(nuke);
				return;
			}
		}
	});

	socket.on("newShip",function(){
		for(var i = 0; i < v.bodies.length; i++){
			if(v.bodies[i].shipId == socket.id){
				v.bodies[i].delete = true;
			}
		}
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
			for (let i = 0; i < 6; i += 2) {
				vals.push(parseInt(color.substr(i, 2), 16));
			}
			getPlayerBody(socket).color = `rgb(${vals.join(",")})`;
		}
	})
});


setInterval(function(){
	for(var i = 0; i < v.bodies.length; i++){
		if(v.bodies[i].shipId != null){
			var player = v.players[v.bodies[i].shipId];
			//v.io.to(id).emit("center",i);
			var speed = 0.1;
			var walkspeed = 3.2;

			let xVel = Math.cos(v.bodies[i].angle * Math.PI / 180);
			let yVel = Math.sin(v.bodies[i].angle * Math.PI / 180);
			v.bodies[i].xVel += xVel * player.acceleration;
			v.bodies[i].yVel += yVel * player.acceleration;

			if (player.accelerating || player.decelerating) {
				let moving = Number(player.accelerating) + -Number(player.decelerating); //will return +1 if accelerating, -1 if decelerating, 0 if both
				player.acceleration = (speed * player.throttle) * moving;

				if(v.bodies[i].colliding){
					let xWalk = xVel*walkspeed*(player.acceleration/speed);
					let yWalk = yVel*walkspeed*(player.acceleration/speed);
					v.bodies[i].x+=xWalk;
					v.bodies[i].y+=yWalk;
					v.bodies[i].xVel+=xWalk;
					v.bodies[i].yVel+=yWalk;
				}
			} else {
				player.acceleration = 0;
			}
			if (player.rotatingLeft || player.rotatingRight) {
				v.bodies[i].angle += rotationSpeed * (Number(player.rotatingRight) + -Number(player.rotatingLeft));
				v.bodies[i].angle += 360; //make sure the direction is positive
				v.bodies[i].angle %= 360; //if the direction is now more than 360, correct that
			}
		}
	}


},50)

setInterval(function(){
	v.io.emit("bodyupdate",JSON.stringify(v.bodies));
},50)

setInterval(function(){
    for(var i = 0; i < v.bodies.length; i++){
        v.bodies[i].update();
    }

    for(var i = 0; i < v.bodies.length; i++){
        v.bodies[i].move();
    }
    for(var i = v.bodies.length-1; i >= 0; i--){
        if(v.bodies[i].delete){
            v.bodies.splice(i,1);
        }
    }
},1);

v.fn.start();

console.log(`Server up on port ${cfg.port}!`);