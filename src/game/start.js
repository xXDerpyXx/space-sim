import React from 'react';
import ReactDOM from 'react-dom';
import d from '../d';
import Events from './events';
import receiveMessages from './chat/receive';
import disconnect from './disconnect';
import { drawMap } from './map/draw';

function startGame() {
    var c = document.getElementById("mainCanvas");
    d.c = c;
    var ctx = c.getContext("2d");
    
    var airResistance = 0;
    var gravity = 0;
    var g = 0.00667;
    var starmin = 500;
    var center = 0;
    var players = [];
    var bodies = [];

    var lastFrame = Date.now();
    
    function distance(a,b){
        return Math.abs(Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y))));
    }
    
    function angle(a,b){
        return Math.atan2(b.y - a.y, b.x - a.x);
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
            this.angle = 0;
        }
    
        
    
        collide(other){
            //if(this.collided || other.delete)
                //return;
            //if(other.mass > this.mass){
                //return;
            //}
            let totalmass = this.mass + other.mass
            let myportion = this.mass/totalmass
            let otherportion = other.mass/totalmass
            //console.log(myportion+", "+otherportion)
            this.xVel = ((this.xVel*myportion) + (other.xVel*otherportion))/2
            this.yVel = ((this.yVel*myportion) + (other.yVel*otherportion))/2
            this.mass += other.mass;
            //this.size = totalmass
                /*
            let oldxVel = this.xVel;
            let oldyVel = this.yVel;
            let thisProportion = this.mass/other.mass;
            let otherProportion = other.mass/this.mass;
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
    
            for(let i = 0; i < bodies.length; i++){
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
                        let totalmass = this.mass+bodies[i].mass
                        let r = distance(this,bodies[i]);
                        let f = ((g*((/*this.mass**/bodies[i].mass)/(r*r))))//*(bodies[i].mass/totalmass);
                        let xoff = Math.abs(this.x-bodies[i].x)
                        let yoff = Math.abs(this.y-bodies[i].y)
                        let toff = xoff+yoff;
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
    for(let i = -15; i < 15; i++){
        for(let j = -15; j < 15; j++){
            let temp = new body(100+(i*spacing),100+(j*spacing));
            temp.xVel = (Math.random()*0.5)-0.25;
            temp.yVel = (Math.random()*0.5)-0.25;
            let m = (Math.random()*50)+25
            temp.size = m;
            temp.mass = m;
            if((i+j)%2 == 0)
            bodies.push(temp);
        }
    }
    */
    
    var dirs = [false,false,false,false]
    
    
    
    function draw(body) {
        body.size = Math.sqrt((body.mass/body.density)/Math.PI)
        body.path.push([body.x,body.y]);
        ctx.strokeStyle = "#FF0000";//body.pathColor;
        ctx.moveTo(body.path[0][0]-cOffsetx,body.path[0][1]-cOffsety);
        for(let i = 0; i < body.path.length; i++){
            ctx.lineTo(body.path[i][0]-cOffsetx,body.path[i][1]-cOffsety);
        }
        ctx.stroke();
        if(body.path.length > body.pathMax){
            body.path.splice(0,1)
        }
        var brightnessOffset = 50;
        //body.size = body.mass/10
        var offset = 0
        
        if(body.mass > starmin){
            for(let i = 0; i < 20; i++){
                var tcolor = body.color;
                tcolor = tcolor.replace(")",","+0.05+")").replace("rgb(","rgba(");
                ctx.fillStyle = tcolor;
                ctx.strokeStyle = tcolor;
                ctx.beginPath();
                ctx.arc(body.x+offset-cOffsetx,body.y+offset-cOffsety,(body.size/2)+((i*(body.size/starmin))*brightnessOffset),0,2*Math.PI)
                ctx.fill();
                ctx.stroke();
            }

            for(var i = 0; i < bodies.length; i++){
                if(bodies[i].mass > starmin){
                    continue;
                }
                var d = distance(body,bodies[i]) 
                if(d < (body.size/2)+((20*(body.size/starmin))*brightnessOffset)){
                    ctx.strokeStyle = "#000000";
                    var slength = ((body.size/2)+((20*(body.size/starmin))*brightnessOffset)) - d
                    var twidth = ctx.lineWidth;
                    ctx.lineWidth = bodies[i].size
                    if(bodies[i].shipId != null){
                        ctx.lineWidth = bodies[i].size*8
                    }
                    var a = angle(body,bodies[i]);
                    ctx.beginPath();
                    ctx.moveTo(bodies[i].x-cOffsetx,bodies[i].y-cOffsety)
                    ctx.lineTo((bodies[i].x+(Math.cos(a)*slength))-cOffsetx,(bodies[i].y+(Math.sin(a)*slength))-cOffsety)
                    ctx.stroke();
                    ctx.lineWidth = twidth;
                }
            }
        }


        
        ctx.fillStyle = body.color;
            //this.size/2;
            ctx.strokeStyle = body.color;
            if(body.shipId == null){
                
                ctx.beginPath();
                ctx.arc(body.x+offset-cOffsetx,body.y+offset-cOffsety,body.size/2,0,2*Math.PI)
                ctx.fill();
                ctx.stroke();
                
               
            }else{
                /*
                ctx.beginPath();
                ctx.arc(body.x+offset-cOffsetx,body.y+offset-cOffsety,body.size*4,0,2*Math.PI)
                ctx.fill();
                ctx.stroke();
*/
                var a = body.angle * (Math.PI/180)
                var s = 10;
                var twidth = ctx.lineWidth;
                ctx.lineWidth = body.size*8;
               ctx.beginPath();
               ctx.moveTo(body.x+offset-cOffsetx,body.y+offset-cOffsety)
               ctx.lineTo(((Math.cos(a)*s)+offset-cOffsetx)+body.x,((Math.sin(a)*s)+offset-cOffsety)+body.y)
               ctx.stroke();
               ctx.lineWidth = twidth;
            }
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#FF0000";
        ctx.strokeStyle = "#FF0000";
        //ctx.fillRect(this.x-cOffsetx,this.y-cOffsety,1,1)
        ctx.beginPath();
        ctx.moveTo(body.x-cOffsetx,body.y-cOffsety)
        var scale = 20;
        ctx.lineTo((body.xVel*scale)+body.x-cOffsetx,(body.yVel*scale)+body.y-cOffsety);
        ctx.stroke();
        if(body.nuke){
            ctx.fillStyle = "#FFFF00";
            ctx.fillText("*",body.x,body.y)
        }
        //ctx.fillRect(this.x-offset,this.y-offset,this.size,this.size);
    }

    Events.register();
    
    d.intervals.colliding = setInterval(function(){
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
    
    for(let k = 0; k < swarm.length; k++){
        for(let i = 0; i < swarm[k].swarmSize; i++){
            let period = (Math.PI*2)/swarm[k].swarmSize
            let deg = period*i+(swarm[k].off);
            let tx = (Math.cos(deg)*swarm[k].d)+swarm[k].centerx
            let ty = (Math.sin(deg)*swarm[k].d)+swarm[k].centery;
            let temp = new body(tx,ty);
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
    
    d.intervals.draw = setInterval(function(){
        if(bodies.length > 0){
            cOffsetx = bodies[center].x-c.width/2;
            cOffsety = bodies[center].y-c.height/2;
        }
        players = [];
        for(let i in bodies){
            if(i != center && bodies[i].shipId != null){
                players.push(i);
            }
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,0,c.width,c.height);
        for(let i of bodies){
            draw(i);
        }
        drawMap(bodies, center);
        
        if(bodies[center] == null){
            return;
        }

        let currentFrame = Date.now();

        document.getElementById("speedspan").innerHTML = Math.round(Math.sqrt((bodies[center].yVel*bodies[center].yVel)+(bodies[center].xVel*bodies[center].xVel))*100)/100
        document.getElementById("xcoord").innerHTML = Math.round(bodies[center].x)
        document.getElementById("ycoord").innerHTML = Math.round(bodies[center].y)
        document.getElementById("playersOnline").innerHTML = players.length + 1;
        document.getElementById("FPSDisplay").innerHTML = Math.round(1000 / (currentFrame - lastFrame));

        lastFrame = currentFrame;
        /*for(let i = 0; i < bodies.length; i++){
            bodies[i].update();
        }
    
        for(let i = 0; i < bodies.length; i++){
            bodies[i].move();
        }
        for(let i = bodies.length-1; i >= 0; i--){
            if(bodies[i].delete){
                bodies.splice(i,1);
            }
        }*/
    },50);
    
    var myid = 0;
    d.socket.on("connect",function(){
        myid = d.socket.id;
    });

    d.socket.on("pong", ms => {
        document.getElementById('ping').innerHTML = ms;
    });

    d.socket.on("kick", kickMessage => {
        setTimeout(() => {
            disconnect();
            alert(kickMessage);
        }, 500);
    })
    
    d.socket.on("disconnect", () => {
        setTimeout(() => {
            disconnect();
            alert("Communication between you and the server was interrupted.");
        }, 500);
    });
    
    d.socket.on("bodyupdate",function(b){
        bodies = JSON.parse(b)
        let foundCenter = false;
        for(let i in bodies){
            if(bodies[i].shipId != null){
                let id = bodies[i].shipId
                if(id == myid){
                    center = i;
                    foundCenter = true;
                }
            }
        }
        if(!foundCenter){
            center = 0;
            d.socket.emit("newShip");
        }
    });
    
    d.socket.on("center",function(k){
        center = k;
    });

    receiveMessages();
}

export default startGame;