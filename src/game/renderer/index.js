import React from 'react';
import ReactDOM from 'react-dom';
import d from '../../d';
import Events from '../events';
import receiveMessages from '../chat/receive';
import disconnect from '../disconnect';
import { drawMap } from '../map/draw';
import { shipPath2D } from './shipPath';
//setup canvas
function startGame() {
    var c = document.getElementById("mainCanvas");
    d.c = c;
    var ctx = c.getContext("2d");

    var starmin = 1000;
    var center = 0; //id of client
    var players = []; //player list, doesn't contain physics details
    var bodies = []; //object list

    var lastFrame = Date.now();

    function distance(a,b) {
        return Math.abs(Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y))));
    }

    function angle(a,b) { //returns angle between 2 points in radians
        return Math.atan2(b.y - a.y, b.x - a.x);
    }

    class body{
        constructor(x,y) {
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
    }


    var dirs = [false,false,false,false]



    function draw(body) {
        body.size = Math.sqrt((body.mass/body.density)/Math.PI)
        body.path.push([body.x,body.y]);
        ctx.strokeStyle = "#FF0000";//body.pathColor;
        ctx.moveTo(body.path[0][0]-cOffsetx,body.path[0][1]-cOffsety);
        for (let i of body.path)
            ctx.lineTo(i[0]-cOffsetx,i[1]-cOffsety);
        ctx.stroke();
        if (body.path.length > body.pathMax)
            body.path.splice(0,1);
        var brightnessOffset = 50*(body.density*10);
        //body.size = body.mass/10
        var offset = 0
        if (body.density > 3.5)
            return;
        if (body.mass > starmin) { //if star
            for (let i = 0; i < 20; i++) { //layers of brightness
                var tcolor = body.color;
                tcolor = tcolor.replace(")",","+0.05+")").replace("rgb(","rgba(");
                ctx.fillStyle = tcolor;
                ctx.strokeStyle = tcolor;
                ctx.beginPath();
                ctx.arc(body.x+offset-cOffsetx,body.y+offset-cOffsety,(body.size/2)+((i*(body.size/starmin))*brightnessOffset),0,2*Math.PI)
                ctx.fill();
                ctx.stroke();
            }

            for (let i of bodies) { //draw shadows
                if (i.mass > starmin) { // ignore stars
                    continue;
                }
                var d = distance(body,i) //get distance
                if (d > (body.size/2)+(i.size/2) && d < (body.size/2)+((20*(body.size/starmin))*brightnessOffset)) { //if in light
                    ctx.strokeStyle = "#000000";
                    ctx.fillStyle = "#000000";
                    var slength = ((body.size/2)+((20*(body.size/starmin))*brightnessOffset)) - d //length from object to edge of light
                    slength *= 2;
                    var twidth = ctx.lineWidth; //save old width
                    let size = i.size;
                    if (i.shipId != null) {
                        size *= 8;
                    }
                    ctx.lineWidth = 1;//= size; //width of shadow
                    
                    let a = angle(body,i); // angle from star to planet
                    ctx.beginPath();
                    //ctx.moveTo(i.x-cOffsetx,i.y-cOffsety);
                    var sc = {x:(Math.cos(a)*body.size/2)+body.x,y:(Math.sin(a)*body.size/2)+body.y};//shadow start on star's surface
                    let ra = a+(Math.PI/2);
                    let rx = (Math.cos(ra)*(size/2))+i.x;
                    let ry = (Math.sin(ra)*(size/2))+i.y;
                    let a1 = angle(sc, {x: rx, y: ry});
                    ctx.moveTo(rx-cOffsetx,ry-cOffsety)
                    ctx.lineTo(((rx+(Math.cos(a1)*slength))-cOffsetx),((ry+(Math.sin(a1)*slength))-cOffsety));
                    let la = a+((Math.PI/2)*3);
                    let lx = (Math.cos(la)*(size/2))+i.x;
                    let ly = (Math.sin(la)*(size/2))+i.y;
                    let a2 = angle(sc, {x: lx, y: ly});
                    ctx.lineTo(((lx+(Math.cos(a2)*slength))-cOffsetx),((ly+(Math.sin(a2)*slength))-cOffsety));
                    ctx.lineTo(lx-cOffsetx,ly-cOffsety)
                    ctx.closePath();
                    ctx.fill(); // draw shadow
                    ctx.stroke(); // draw shadow
                    ctx.lineWidth = twidth;
                }
            }
        }



        ctx.fillStyle = body.color;
            ctx.strokeStyle = body.color;
            if (body.shipId == null) {

                ctx.beginPath();
                ctx.arc(body.x+offset-cOffsetx,body.y+offset-cOffsety,body.size/2,0,2*Math.PI)
                ctx.fill();
                ctx.stroke();


            } else {
                let a = (body.angle - 90) * (Math.PI/180);
                ctx.translate(body.x+offset-cOffsetx,body.y+offset-cOffsety);
                ctx.rotate(a);
                ctx.stroke(shipPath2D);
                ctx.fill(shipPath2D);
                ctx.rotate(-a);
                ctx.translate(-(body.x+offset-cOffsetx),-(body.y+offset-cOffsety));
            }

        //normal planet drawing
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#FF0000";
        ctx.strokeStyle = "#FF0000";
        //ctx.fillRect(this.x-cOffsetx,this.y-cOffsety,1,1)
        ctx.beginPath();
        ctx.moveTo(body.x-cOffsetx,body.y-cOffsety)
        var scale = 20;
        ctx.lineTo((body.xVel*scale)+body.x-cOffsetx,(body.yVel*scale)+body.y-cOffsety);
        ctx.stroke();
        if (body.nuke) {
            ctx.fillStyle = "#FFFF00";
            ctx.fillText("*",body.x,body.y)
        }
        for(let t of body.texture){
            ctx.strokeStyle = t.color;
            ctx.lineWidth = t.width;
            ctx.beginPath();
            ctx.moveTo((t.sx+body.x)-cOffsetx,(t.sy+body.y)-cOffsety)
            ctx.lineTo((t.ex+body.x)-cOffsetx,(t.ey+body.y)-cOffsety)
            ctx.stroke();

        }
        //ctx.fillRect(this.x-offset,this.y-offset,this.size,this.size);
    }

    Events.register();

    var cOffsetx = 0;
    var cOffsety = 0

    d.intervals.draw = setInterval(function() {
        if (bodies.length > 0) {
            cOffsetx = bodies[center].x-c.width/2;
            cOffsety = bodies[center].y-c.height/2;
        }
        players = [];
        for (let i in bodies) {
            if (i != center && bodies[i].shipId != null) {
                players.push(i);
            }
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,0,c.width,c.height);
        if (bodies[center] != undefined) {
            for (let i of bodies) {
                if (distance(i,bodies[center]) < d.c.width*3) {
                    draw(i);
                }
            }
        }

        drawMap(bodies, center);

        if (bodies[center] == null) {
            return;
        }

        let currentFrame = Date.now();

        document.getElementById("speedspan").innerHTML = Math.round(Math.sqrt((bodies[center].yVel*bodies[center].yVel)+(bodies[center].xVel*bodies[center].xVel))*100)/100
        document.getElementById("xcoord").innerHTML = Math.round(bodies[center].x)
        document.getElementById("ycoord").innerHTML = Math.round(bodies[center].y)
        document.getElementById("playerCount").innerHTML = players.length + 1;
        document.getElementById("FPSDisplay").innerHTML = Math.round(1000 / (currentFrame - lastFrame));

        lastFrame = currentFrame;
    },50);

    var myid = 0;

    d.socket.on("connect",function() {
        myid = d.socket.id;
    });

    d.socket.on("pong", ms => {
        document.getElementById('ping').innerHTML = ms;
    });

    d.socket.on("kick", kickMessage => {
        setTimeout(() => {
            disconnect(kickMessage);
        }, 500);
    })

    d.socket.on("disconnect", () => {
        setTimeout(() => {
            disconnect("Communication between you and the server was interrupted.");
        }, 750);
    });

    d.socket.on("fuelUpdate", fuel => {
        d.fuel.current = fuel;
    });

    d.socket.on("fuelUsageUpdate", fuelUsage => {
        d.fuel.currentUsage = fuelUsage;
    });

    d.socket.on("bodyupdate",function(b) {
        bodies = JSON.parse(b);
        let foundCenter = false;
        for (let i in bodies) {
            if (bodies[i].shipId != null) {
                let id = bodies[i].shipId
                if (id == myid) {
                    center = i;
                    foundCenter = true;
                }
            }
        }
        if (!foundCenter) {
            center = 0;
            d.socket.emit("newShip");
        }
    });

    d.socket.on("center",function(k) {
        center = k;
    });

    receiveMessages();
}

export default startGame;