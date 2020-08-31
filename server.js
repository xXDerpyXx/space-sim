
var bodies = [];
var val = "";
var players = [];
var port = 3979;
var userTotal = 0;
var config = {
	width:30,
	height:30,
	sealevel:55,
	startpop:50
}
var express = require('express');
var app     = express();
//var server  = app.listen(port);
var server      = app.listen(port);
var io = require('socket.io').listen(server,{pingTimeout: 30000, pingInterval: 100});
io.set('heartbeat timeout', 30000);
io.set('heartbeat interval', 4);

class player{
	constructor(id){
		this.id = id;
		this.dirs = [false,false,false,false];
		this.ship = null;
	}
}

//done
app.use(express.static("public"));

io.on('connection', function(socket){
	userTotal += 1;
	socket.emit('newVal',val);
	socket.emit("resetplayers");
	console.log('a user connected');
	console.log('user count: '+userTotal)
	for(var i = 0; i < bodies.length; i++){
		if(bodies[i].shipId == socket.id){
			bodies[i].delete = true;
		}
	}
	players[socket.id] = new player(socket.id);
	var temp = new body(0,0);
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
		for(var i = 0; i < bodies.length; i++){
			if(bodies[i].shipId == socket.id){
				players[socket.id].ship = i;
			}
		}
		bodies.splice(players[socket.id].ship,1)
		players.splice(parseInt(socket.id),1);
		
		socket.broadcast.emit("delete",socket.id)
	});
    

	socket.on("dir",function(d,val){
		players[socket.id].dirs[d] = val;
	})

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
	})

	
});

function distance(a,b){
    return Math.abs(Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y))));
}

function angle(a,b){
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}


var airResistance = 0;
var gravity = 0;
var g = 0.00667;
var starmin = 500;

class body{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.xVel = 0;
        this.yVel = 0;
        this.bouncyness = 0.5;
        this.mass = 10;
        this.size = 10;
        this.color = "#FFFFFF";
        this.collided = false;
        this.delete = false;
        this.path = [];
        this.pathMax = 100;
        this.pathColor = "#0000FF";
        this.invincible = false;
		this.colliding = false;
		this.shipId = null;
		this.density = 0.1;
	}
	
    collide(other){
        //if(this.collided || other.delete)
            //return;
        //if(other.mass > this.mass){
            //return;
        //}
        var totalmass = this.mass + other.mass
        var myportion = this.mass/totalmass
        var otherportion = other.mass/totalmass
        console.log(myportion+", "+otherportion)
        this.xVel = ((this.xVel*myportion) + (other.xVel*otherportion))/2
        this.yVel = ((this.yVel*myportion) + (other.yVel*otherportion))/2
		this.mass += other.mass;
		this.size = Math.sqrt((this.mass/this.density)/Math.PI)
        //this.size = totalmass
            /*
        var oldxVel = this.xVel;
        var oldyVel = this.yVel;
        var thisProportion = this.mass/other.mass;
        var otherProportion = other.mass/this.mass;
        this.xVel = other.xVel * otherProportion;
        this.yVel = other.yVel * otherProportion;
        other.yVel = oldyVel * thisProportion;
        other.xVel = oldxVel * thisProportion;
        this.collided = true;
        other.collided = true;
        */
    }

    move(){
        this.y += this.yVel;
        this.x += this.xVel;
        this.yVel += gravity;
        if(this.delete){
            return;
        }
    }

    update(){
		
        if(this.delete){
            return;
		}
		this.size = Math.sqrt((this.mass/this.density)/Math.PI)
        this.colliding = false;

        for(var i = 0; i < bodies.length; i++){
			//bodies[i].size = Math.sqrt(Math.PI/(bodies[i].mass/bodies[i].density))
            if(bodies[i].x != this.x && bodies[i].y != this.y){
                if(distance(bodies[i],this) < ((this.size/2)+(bodies[i].size/2)) && !this.collided){
                    this.colliding = true;
                    if(this.mass > bodies[i].mass || this.mass == bodies[i].mass){
                        if(!bodies[i].invincible){
                            this.collide(bodies[i]);
                            bodies[i].delete = true;
                            bodies[i].collided = true;
                            this.collided = true;
                        }
                    }else{
                        //bodies[i].collide(bodies[i]);
                        //this.delete = true;
                        //this.collided = true;
                        //bodies[i].collided = true;
                        if(this.invincible){
                            this.xVel = bodies[i].xVel
                            this.yVel = bodies[i].yVel
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

                }
            }
        }
        this.collided = false;
    }

}


setInterval(function(){
	for(var i = 0; i < bodies.length; i++){
		if(bodies[i].shipId != null){
			var id = bodies[i].shipId
			//io.to(id).emit("center",i);
			var speed = 0.01;
			var walkspeed = 1
			if(players[id].dirs[0]){
				bodies[i].xVel+=speed;
				if(bodies[i].colliding){
					bodies[i].x+=walkspeed;
					bodies[i].xVel+=walkspeed;
				}
			}
			if(players[id].dirs[1]){
				bodies[i].xVel-=speed;
				if(bodies[i].colliding){
					bodies[i].x-=walkspeed;
					bodies[i].xVel-=walkspeed;
				}
			}
			if(players[id].dirs[2]){
				bodies[i].yVel+=speed;
				if(bodies[i].colliding){
					bodies[i].y+=walkspeed;
					bodies[i].yVel+=walkspeed;
				}
			}
			if(players[id].dirs[3]){
				bodies[i].yVel-=speed;
				if(bodies[i].colliding){
					bodies[i].y-=walkspeed;
					bodies[i].yVel-=walkspeed;
				}
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

var spacing = 200;
for(var i = -15; i < 15; i++){
    for(var j = -15; j < 15; j++){
        var temp = new body(100+(i*spacing),100+(j*spacing));
        temp.xVel = (Math.random()*0.5)-0.25;
        temp.yVel = (Math.random()*0.5)-0.25;
        var m = (Math.random()*50)+25
        temp.size = Math.sqrt((temp.mass/temp.density)/Math.PI)
        temp.mass = m;
        if((i+j)%2 == 0)
        bodies.push(temp);
    }
}

/*
temp = new body(250,250);
temp.xVel = 0//(Math.random()*2)-1;
temp.yVel = 0//(Math.random()*2)-1;
m = 700
temp.size = m/10;
temp.mass = m;
bodies.push(temp);
*/
var swarm = [
    //{swarmSize:10,centerx:250,centery:250,d:400,vel:0.10,m:40,off:0},
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


console.log("FINISHED");

//ref();
