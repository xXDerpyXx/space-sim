const cfg = require('./cfg');
var startDate = Date.now();

var bodies = [];
var val = "";
var players = [];
var userTotal = 0;

const rotationSpeed = 15;

var app = require('express')();

app.use(require('cors')());

var server = app.listen(cfg.port);
var io = require('socket.io').listen(server,{pingTimeout: 30000, pingInterval: 100});
io.set('heartbeat timeout', 30000);
io.set('heartbeat interval', 4);

class player{
	constructor(id){
		this.id = id;
		this.accelerating = false;
		this.decelerating = false;
		this.acceleration = 0;
		this.direction = 0;
		this.rotatingLeft = false;
		this.rotatingRight = false;
		this.ship = null;
	}
}

//done
//app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("This is a space-sim server.");
})

app.get("/basicinfo", (req, res) => {
    res.json({
        name: cfg.name,
        players: `${userTotal}/${cfg.playerLimit}`,
		location: cfg.location,
		uptime: Date.now() - startDate,
    });
});

function getPlayerBody(socket) {
	return bodies.filter(body => body.shipId == socket.id)[0];
}

io.on('connection', function(socket){
	if (userTotal >= cfg.playerLimit) {
		socket.emit('kick', 'This server is full!');
		socket.disconnect(true);
		return;
	}
	userTotal += 1;
	socket.emit('newVal',val);
	socket.emit("resetplayers");
	console.log('a user connected');
	console.log('user count: '+userTotal);
	for(var i = 0; i < bodies.length; i++){
		if(bodies[i].shipId == socket.id){
			bodies[i].delete = true;
		}
	}
	players[socket.id] = new player(socket.id);
	var temp = new body(Math.random()*20,Math.random()*20);
	temp.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
	temp.mass = 2;
	temp.shipId = socket.id;
	temp.invincible = true;
	temp.density = 1;
	bodies.push(temp)
	players[socket.id].ship = bodies.length-1
	//socket.emit('getNum',Math.floor((Math.random()*100)+1));
	socket.on('disconnect', function(){
		userTotal -= 1;
		console.log('a user disconnected');
		console.log('user count: '+userTotal);
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].shipId == socket.id){
				players[socket.id].ship = i;
			}
		}
		bodies.splice(players[socket.id].ship,1)
		players.splice(parseInt(socket.id),1);
		
		socket.broadcast.emit("delete",socket.id);
	});
    

	socket.on("accelerate", stop => {
		players[socket.id].accelerating = Boolean(stop);
		//console.log(players[socket.id]);
	});

	socket.on("decelerate", stop => {
		players[socket.id].decelerating = Boolean(stop);
		//console.log(players[socket.id]);
	});

	socket.on("rotateleft", stop => {
		players[socket.id].rotatingLeft = Boolean(stop);
		//console.log(players[socket.id]);
	});

	socket.on("rotateright", stop => {
		players[socket.id].rotatingRight = Boolean(stop);
		//console.log(players[socket.id]);
	});

	socket.on("setangle", angle => {
		if (typeof angle == "number" && angle >= 0)
			bodies.find(e => e.shipId == socket.id).angle = angle % 360;
	});

	socket.on("nuke",function(){
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].shipId == socket.id){
				var nuke = new body(bodies[i].x,bodies[i].y);
				nuke.nuke = true;
				nuke.xVel = bodies[i].xVel;
				nuke.yVel = bodies[i].yVel;
				nuke.mass = 10;
				nuke.color = "#FFFF00";
				//bodies.push(nuke);
				return;
			}
		}
	});

	socket.on("newShip",function(){
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].shipId == socket.id){
				bodies[i].delete = true;
			}
		}
		var temp = new body(0,0);
		temp.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
		temp.mass = 2;
		temp.shipId = socket.id;
		temp.density = 1;
		bodies.push(temp)
		players[socket.id].ship = bodies.length-1
	});

	socket.on("sendMessage", content => {
		if (typeof content != "string" || content.length > 100)
			return;
		let userBody = getPlayerBody(socket);
		io.emit("message", {
			color: userBody.color
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

function distance(a,b){
    return Math.abs(Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y))));
}

function angle(a,b){
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

function normalize(vec){
	var mag = Math.sqrt((vec.x*vec.x)+(vec.y*vec.y))
	return {"x":vec.x/mag,"y":vec.y/mag}
}

function dotProduct(vec1,vec2){
	var ang = angle(vec1,vec2);
	return {"x":Math.abs(vec1.x*vec2.x*Math.cos(ang)),"y":Math.abs(vec1.y*vec2.y*Math.cos(ang))}
}


var airResistance = 0;
var gravity = 0;
var g = 0.00667;
var starmin = 1000;
var starmax = 20000;
var tidalmin = 0.002;
var explodemin = 20;
var explodeSpeed = 1;

class body{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.xVel = 0;
        this.yVel = 0;
        this.bouncyness = 0.5;
        this.mass = 10;
        this.size = 10;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";;
        this.collided = false;
        this.delete = false;
        this.path = [];
        this.pathMax = 100;
        this.pathColor = "#0000FF";
        this.invincible = false;
		this.colliding = false;
		this.shipId = null;
		this.density = 0.1;
		this.invincibilityCooldown = 0;
		this.nuke = false;
		this.angle = 0;
	}

	explode(other,force){
		
		if(force == null){
			force = 0.2
		}
		
		this.delete = true;
		var parts = Math.floor(Math.random()*10)+2
		if(this.mass/parts < explodemin){
			parts = 2;
		}
		//var plane = angle(this,other)
		var n = normalize({"x":this.x-other.x,"y":this.y-other.y});
		var v = {"x":this.xVel,"y":this.yVel}
		var refang = dotProduct(v,n)
		var r = {"x":v.x-(2*refang.x*n.x*n.x),"y":v.y-(2*refang.y*n.y*n.y)}
		var tvel = Math.sqrt((this.xVel*this.xVel)+(this.yVel*this.yVel))
		r = normalize(r);
		var totalmass = this.mass;
		var avgmass = this.mass/parts;
		for(var i = 0; i < parts; i++){
			var m = Math.floor(avgmass + ((Math.random()*avgmass)-(avgmass/2)));
			if(m > totalmass){
				m = totalmass;
			}
			totalmass -= m;
			var temp = new body(this.x,this.y);
			temp.invincibilityCooldown = 20;
			temp.mass = m;
			temp.color = this.color;
			var newxvel = r.x*tvel+((Math.random()*force)-(force/2));
			var newyvel = r.y*tvel+((Math.random()*force)-(force/2));
			temp.xVel = newxvel;
			temp.yVel = newyvel;
			bodies.push(temp);
			if(totalmass == 0){
				return;
			}

		}
		if(totalmass != 0){
			var temp = new body(this.x,this.y);
			temp.invincibilityCooldown = 10;
			temp.mass = totalmass;
			var newxvel = r.x*tvel+((Math.random()*tvel/5)-tvel/10);
			var newyvel = r.y*tvel+((Math.random()*tvel/5)-tvel/10);
			temp.xVel = newxvel;
			temp.yVel = newyvel;
			bodies.push(temp);
		}

		
	}
	
    collide(other){
        var totalmass = this.mass + other.mass
        var myportion = this.mass/totalmass
        var otherportion = other.mass/totalmass
        this.xVel = ((this.xVel*myportion) + (other.xVel*otherportion))/2
        this.yVel = ((this.yVel*myportion) + (other.yVel*otherportion))/2
		this.mass += other.mass;
		this.size = Math.sqrt((this.mass/this.density)/Math.PI)
    }

    move(){
		if(this.delete){
            return;
        }
        this.y += this.yVel;
        this.x += this.xVel;
        this.yVel += gravity;
        
    }

    update(){
		
        if(this.delete){
            return;
		}
		if(this.mass > starmin){
			var percent = this.mass/(starmax-starmin);
			var red = Math.round(255*percent);
			var blue = Math.round((1-percent)*255);
			this.color = "rgb("+red+","+0+","+blue+")";

		}
		this.size = Math.sqrt((this.mass/this.density)/Math.PI)
        this.colliding = false;
		if(this.invincibilityCooldown < 1){
			
			var speed = Math.sqrt((this.xVel*this.xVel)+(this.yVel*this.yVel));
			for(var i = 0; i < bodies.length; i++){
				if(this.invincible && bodies[i].nuke){
					continue;
				}
				if(bodies[i].invincible && this.nuke){
					continue;
				}
				if(bodies[i].invincibilityCooldown > 0 || bodies[i].delete){
					continue;
				}
				if(bodies[i].nuke || bodies[i].delete || this.delete){
					continue;
				}
				//bodies[i].size = Math.sqrt(Math.PI/(bodies[i].mass/bodies[i].density))
				if(bodies[i].x != this.x && bodies[i].y != this.y){
					if(distance(bodies[i],this) < ((this.size/2)+(bodies[i].size/2)) && !this.collided){
						this.colliding = true;
						if(this.nuke && !bodies[i].invincible && bodies[i].mass > explodemin){
							this.delete = true;
							bodies[i].explode(this,bodies[i].size/5);
							
						}
						if(this.nuke){
							continue;
						}
						
						var otherspeed = Math.sqrt((bodies[i].xVel*bodies[i].xVel)+(bodies[i].yVel*bodies[i].yVel));
						if(speed > explodeSpeed && this.mass > explodemin && !this.invincible && this.mass < starmin){
							this.explode(bodies[i]);
							return;
						}else if(otherspeed > explodeSpeed && bodies[i].mass > explodemin && !bodies[i].invincible && bodies[i].mass < starmin){
							bodies[i].explode(this);
							return;
						
						}else{
							if(this.mass > bodies[i].mass || this.mass == bodies[i].mass){
								if(!bodies[i].invincible && !bodies[i].nuke){
									this.collide(bodies[i]);
									bodies[i].delete = true;
									bodies[i].collided = true;
									this.collided = true;
								}
							}else{
								if(this.invincible){
									this.xVel = bodies[i].xVel
									this.yVel = bodies[i].yVel
								}
							}
						}
						
						
						
						
					}else{
						var totalmass = this.mass+bodies[i].mass
						var r = distance(this,bodies[i]);
						var f = ((g*((/*this.mass**/bodies[i].mass)/(r*r))))//*(bodies[i].mass/totalmass);
						var xoff = Math.abs(this.x-bodies[i].x)
						var yoff = Math.abs(this.y-bodies[i].y)
						var toff = xoff+yoff;
						if(this.x < bodies[i].x){
							this.xVel += f * (xoff/toff);
						}else{
							this.xVel += f * ((xoff*-1)/toff);
						}
						if(this.y < bodies[i].y){
							this.yVel += f * (yoff/toff);
						}else{
							this.yVel += f * ((yoff*-1)/toff);
						}
						if(f > tidalmin && this.mass > explodemin && this.mass < starmin && this.shipId == null && !this.nuke){
							this.explode(bodies[i],1)
                        }
					}
				}
			}
			this.collided = false;
		}else{
			this.invincibilityCooldown--;
		}
    }

}


setInterval(function(){
	for(var i = 0; i < bodies.length; i++){
		if(bodies[i].shipId != null){
			var player = players[bodies[i].shipId];
			//io.to(id).emit("center",i);
			var speed = 0.03;
			var walkspeed = 1;

			let xVel = Math.cos(bodies[i].angle * Math.PI / 180);
			let yVel = Math.sin(bodies[i].angle * Math.PI / 180);
			bodies[i].xVel += xVel * player.acceleration;
			bodies[i].yVel += yVel * player.acceleration;

			if (player.accelerating || player.decelerating) {
				let moving = Number(player.accelerating) + -Number(player.decelerating); //will return +1 if accelerating, -1 if decelerating, 0 if both
				player.acceleration = speed * moving;

				if(bodies[i].colliding){
					let xWalk = xVel*walkspeed;
					let yWalk = yVel*walkspeed;
					bodies[i].x+=xWalk;
					bodies[i].y+=yWalk;
					bodies[i].xVel+=xWalk;
					bodies[i].yVel+=yWalk;
				}
			} else {
				player.acceleration = 0;
			}
			if (player.rotatingLeft || player.rotatingRight) {
				bodies[i].angle += rotationSpeed * (Number(player.rotatingRight) + -Number(player.rotatingLeft));
				bodies[i].angle += 360; //make sure the direction is positive
				bodies[i].angle %= 360; //if the direction is now more than 360, correct that
			}
		}
	}
    

},50)

setInterval(function(){
	io.emit("bodyupdate",JSON.stringify(bodies));
},50)

setInterval(function(){
    for(var i = 0; i < bodies.length; i++){
        bodies[i].update();
    }

    for(var i = 0; i < bodies.length; i++){
        bodies[i].move();
    }
    for(var i = bodies.length-1; i >= 0; i--){
        if(bodies[i].delete){
            bodies.splice(i,1);
        }
    }
},1);

var spacing = 1000;
var bodyCount = 10*10;
var universeSize = 20000;

for(var i = 0; i < bodyCount; i++){
	var temp = new body((Math.random()*universeSize*2)-universeSize,(Math.random()*universeSize*2)-universeSize);
	temp.xVel = (Math.random()*1)-0.5;
	temp.yVel = (Math.random()*1)-0.5;
	var m = (Math.random()*900)+50
	if(Math.random() > 0.95){
		m = (Math.random()*10000)+1200
	}
	temp.size = Math.sqrt((temp.mass/temp.density)/Math.PI)
	temp.mass = m;
	//if((i+j)%2 == 0)
	bodies.push(temp);
}


/*
for(var i = -15; i < 15; i++){
    for(var j = -15; j < 15; j++){
        var temp = new body(100+(i*spacing),100+(j*spacing));
        temp.xVel = (Math.random()*1)-0.5;
        temp.yVel = (Math.random()*1)-0.5;
        var m = (Math.random()*600)+10
        temp.size = Math.sqrt((temp.mass/temp.density)/Math.PI)
        temp.mass = m;
        if((i+j)%2 == 0)
        bodies.push(temp);
    }
}
*/
/*
temp = new body(250,250);
temp.xVel = 0//(Math.random()*2)-1;
temp.yVel = 0//(Math.random()*2)-1;
m = 600
temp.size = m/10;
temp.mass = m;
bodies.push(temp);
*/
var swarm = [
    //{swarmSize:10,centerx:250,centery:250,d:600,vel:0.1,m:40,off:0},
    /*{swarmSize:1,centerx:250,centery:250,d:380,vel:0.561,m:2,off:0},*/
    /*{swarmSize:1,centerx:250,centery:250,d:200,vel:0.1,m:5,off:Math.PI}*/
]

for(var k = 0; k < swarm.length; k++){
    for(var i = 0; i < swarm[k].swarmSize; i++){
        var period = (Math.PI*2)/swarm[k].swarmSize
        var deg = period*i+(swarm[k].off);
        var tx = (Math.cos(deg)*swarm[k].d)+swarm[k].centerx
        var ty = (Math.sin(deg)*swarm[k].d)+swarm[k].centery;
        temp = new body(tx,ty);
        temp.xVel = Math.cos(deg+(Math.PI/2))*swarm[k].vel//(Math.random()*2)-1;
        temp.yVel = Math.sin(deg+(Math.PI/2))*swarm[k].vel//(Math.random()*2)-1;
        temp.size = swarm[k].m/10;
        temp.mass = swarm[k].m;
        bodies.push(temp);
    }
}


console.log(`Server up on port ${cfg.port}!`);

//ref();