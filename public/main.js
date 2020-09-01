var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

var airResistance = 0;
var gravity = 0;
var g = 0.00667;
var starmin = 500;
var socket = io(window.location.href, {transports: [ 'websocket']});
var center = 0;
var players = [];
var bodies = [];

function distance(a,b){
    return Math.abs(Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y))));
}

function angle(a,b){
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

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
        //console.log(myportion+", "+otherportion)
        this.xVel = ((this.xVel*myportion) + (other.xVel*otherportion))/2
        this.yVel = ((this.yVel*myportion) + (other.yVel*otherportion))/2
        this.mass += other.mass;
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
        /*
        if(this.x > c.width){
            this.xVel *= -1*this.bouncyness;
            this.x = c.width;
        }

        if(this.y > c.height){
            this.yVel *= -1*this.bouncyness;
            this.y = c.height;
        }

        if(this.x < 0){
            this.xVel *= -1*this.bouncyness;
            this.x = 0;
        }

        if(this.y < 0){
            this.yVel *= -1*this.bouncyness;
            this.y = 0;
        }*/
    }

    update(){
        if(this.delete){
            return;
        }
        this.colliding = false;

        for(var i = 0; i < bodies.length; i++){
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

/*
var temp = new body(150,150);
temp.xVel = 0//(Math.random()*2)-1;
temp.yVel = 0//(Math.random()*2)-1;
var m = 2
temp.size = m/10;
temp.mass = m;
temp.pathColor = "#cc7711"
temp.color = "#00FF00"
bodies.push(temp);*/
/*
var spacing = 200;
for(var i = -15; i < 15; i++){
    for(var j = -15; j < 15; j++){
        var temp = new body(100+(i*spacing),100+(j*spacing));
        temp.xVel = (Math.random()*0.5)-0.25;
        temp.yVel = (Math.random()*0.5)-0.25;
        var m = (Math.random()*50)+25
        temp.size = m;
        temp.mass = m;
        if((i+j)%2 == 0)
        bodies.push(temp);
    }
}
*/

var dirs = [false,false,false,false]



function draw(id){
    bodies[id].size = Math.sqrt((bodies[id].mass/bodies[id].density)/Math.PI)
    bodies[id].path.push([bodies[id].x,bodies[id].y]);
    ctx.strokeStyle = bodies[id].pathColor;
    ctx.moveTo(bodies[id].path[0][0]-cOffsetx,bodies[id].path[0][1]-cOffsety);
    for(var i = 0; i < bodies[id].path.length; i++){
        ctx.lineTo(bodies[id].path[i][0]-cOffsetx,bodies[id].path[i][1]-cOffsety);
    }
    ctx.stroke();
    if(bodies[id].path.length > bodies[id].pathMax){
        bodies[id].path.splice(0,1)
    }
    var brightnessOffset = 50;
    //bodies[id].size = bodies[id].mass/10
    var offset = 0
    if(bodies[id].mass > starmin){
        
        for(var i = 0; i < 20; i++){
            ctx.fillStyle = "rgba(255,255,255,"+0.05+")";
            ctx.strokeStyle = "rgba(255,255,255,"+0.05+")"
            ctx.beginPath();
            ctx.arc(bodies[id].x+offset-cOffsetx,bodies[id].y+offset-cOffsety,(bodies[id].size/2)+((i*(bodies[id].size/starmin))*brightnessOffset),0,2*Math.PI)
            ctx.fill();
            ctx.stroke();
        }
    }
    
    ctx.fillStyle = bodies[id].color;
        //this.size/2;
        ctx.strokeStyle = bodies[id].color;
        if(bodies[id].shipId == null){
            ctx.beginPath();
            ctx.arc(bodies[id].x+offset-cOffsetx,bodies[id].y+offset-cOffsety,bodies[id].size/2,0,2*Math.PI)
            ctx.fill();
            ctx.stroke();
        }else{
            ctx.beginPath();
            ctx.arc(bodies[id].x+offset-cOffsetx,bodies[id].y+offset-cOffsety,bodies[id].size*4,0,2*Math.PI)
            ctx.fill();
            ctx.stroke();
        }
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#FF0000";
    ctx.strokeStyle = "#FF0000";
    //ctx.fillRect(this.x-cOffsetx,this.y-cOffsety,1,1)
    ctx.beginPath();
    ctx.moveTo(bodies[id].x-cOffsetx,bodies[id].y-cOffsety)
    var scale = 20;
    ctx.lineTo((bodies[id].xVel*scale)+bodies[id].x-cOffsetx,(bodies[id].yVel*scale)+bodies[id].y-cOffsety);
    ctx.stroke();
    if(bodies[i].nuke){
        ctx.fillStyle = "#FFFF00";
        ctx.fillText("*",bodies[id].x,bodies[id].y)
    }
    //ctx.fillRect(this.x-offset,this.y-offset,this.size,this.size);
}

window.addEventListener("keydown",function(e){
    var launchVel = 1;
    //console.log(e);
    if(e.code == "Space"){
        socket.emit("nuke");
    }
    if(e.code == "ArrowUp"){
        socket.emit("dir",3,true)
    }
    if(e.code == "ArrowDown"){
        socket.emit("dir",2,true)
    }
    if(e.code == "ArrowLeft"){
        socket.emit("dir",1,true)
    }
    if(e.code == "ArrowRight"){
        socket.emit("dir",0,true)
    }

});

window.addEventListener("keyup",function(e){
    //console.log(e);
    if(e.code == "ArrowUp"){
        socket.emit("dir",3,false)
    }
    if(e.code == "ArrowDown"){
        socket.emit("dir",2,false)
    }
    if(e.code == "ArrowLeft"){
        socket.emit("dir",1,false)
    }
    if(e.code == "ArrowRight"){
        socket.emit("dir",0,false)
    }
})

setInterval(function(){
    var speed = 0.01;
    var walkspeed = 1
    if(dirs[0]){
        bodies[0].xVel+=speed;
        if(bodies[0].colliding){
            bodies[0].x+=walkspeed;
        }
    }
    if(dirs[1]){
        bodies[0].xVel-=speed;
        if(bodies[0].colliding){
            bodies[0].x-=walkspeed;
        }
    }
    if(dirs[2]){
        bodies[0].yVel+=speed;
        if(bodies[0].colliding){
            bodies[0].y+=walkspeed;
        }
    }
    if(dirs[3]){
        bodies[0].yVel-=speed;
        if(bodies[0].colliding){
            bodies[0].y-=walkspeed;
        }
    }

},50)


/*
temp = new body(2100,2100);
temp.xVel = 0//(Math.random()*2)-1;
temp.yVel = 0//(Math.random()*2)-1;
m = 700
temp.size = m/10;
temp.mass = m;
//bodies.push(temp);
*/
var swarm = [
    //{swarmSize:10,centerx:250,centery:250,d:200,vel:0.15,m:20,off:0},
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

/*
temp = new body(250,200);
temp.xVel = 1//(Math.random()*2)-1;
temp.yVel = 0//(Math.random()*2)-1;
m = 20
temp.size = m/10;
temp.mass = m;
bodies.push(temp);

temp = new body(250,300);
temp.xVel = -1//(Math.random()*2)-1;
temp.yVel = 0//(Math.random()*2)-1;
m = 20
temp.size = m/10;
temp.mass = m;
bodies.push(temp);

temp = new body(200,250);
temp.xVel = 0//(Math.random()*2)-1;
temp.yVel = -1//(Math.random()*2)-1;
m = 20
temp.size = m/10;
temp.mass = m;
bodies.push(temp);

temp = new body(300,250);
temp.xVel = 0//(Math.random()*2)-1;
temp.yVel = 1//(Math.random()*2)-1;
m = 20
temp.size = m/10;
temp.mass = m;
bodies.push(temp);
*/

//bodies[0].invincible = true;

var cOffsetx = 0;
var cOffsety = 0

setInterval(function(){
    //if(bodies.length > 0){
        cOffsetx = bodies[center].x-c.width/2;
        cOffsety = bodies[center].y-c.height/2;
    //}
    players = [];
    for(var i = 0; i < bodies.length; i++){
        if(i != center && bodies[i].shipId != null){
            players.push(i);
        }
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,c.width,c.height);
    for(var i = 0; i < bodies.length; i++){
        draw(i);
    }
},50);

var myid = 0;
socket.on("connect",function(){
    myid = socket.id;
})

socket.on("bodyupdate",function(b){
    bodies = JSON.parse(b)
    var foundCenter = false;
    for(var i = 0; i < bodies.length; i++){
		if(bodies[i].shipId != null){
            var id = bodies[i].shipId
            if(id == myid){
                center = i;
                foundCenter = true;
            }
        }
    }
    if(!foundCenter){
        center = 0;
        socket.emit("newShip");
    }
})

socket.on("center",function(k){
    center = k;
})


setInterval(function(){
    if(bodies[center] == null){
        return;
    }
    document.getElementById("speedspan").innerHTML = "velocity: "+(Math.round(Math.sqrt((bodies[center].yVel*bodies[center].yVel)+(bodies[center].xVel*bodies[center].xVel))*100)/100)+"km/s"
    document.getElementById("coordinates").innerHTML = "X: "+Math.round(bodies[center].x)+", Y: "+Math.round(bodies[center].y)
    var temp = "";
    for(var i = 0; i < players.length;i++){
        var k = players[i];
        temp += bodies[k].color+": X: "+Math.round(bodies[k].x)+" Y: "+Math.round(bodies[k].y)+"</br>"
    }
    document.getElementById("playerlist").innerHTML = temp;
    /*for(var i = 0; i < bodies.length; i++){
        bodies[i].update();
    }

    for(var i = 0; i < bodies.length; i++){
        bodies[i].move();
    }
    for(var i = bodies.length-1; i >= 0; i--){
        if(bodies[i].delete){
            bodies.splice(i,1);
        }
    }*/
},1);