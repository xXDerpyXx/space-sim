const v = require('../v');

function distance(a,b) { // distance between bodies
    return Math.abs(Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y))));
}

function angle(a,b) { // angle between bodies
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

function normalize(vec) { //normalize components of a vector between 0 and 1
	let mag = Math.sqrt((vec.x*vec.x)+(vec.y*vec.y))
	if (mag == 0) {
		return {"x":vec.x,"y":vec.y}
	}
	return {"x":vec.x/mag,"y":vec.y/mag}
}

function dotProduct(vec1,vec2) { //trigonometric dot product of 2 vectors
	let ang = angle(vec1,vec2);
	return {"x":Math.abs(vec1.x*vec2.x*Math.cos(ang)),"y":Math.abs(vec1.y*vec2.y*Math.cos(ang))}
}

function splitRGB(color){
	var match = color.match(/rgb?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
	if(match == null){
		return {
			red: 0,
			green: 0,
			blue: 0 }
		
	}
  return {
    red: match[1],
    green: match[2],
    blue: match[3] }

}

function randomGasGiant(body){
	let size = body.size;
	let lines = [];
	let r = size/2;
	let center = {x:r,y:r};
	let cloudwidth = r/7
	let rangle = Math.random()*Math.PI*2;
	let base = splitRGB(body.color);
	for(var i = 0; i < (Math.random()*5)+3;i++){
		let cloud = {};
		cloud.sx = (Math.cos(rangle)*r);
		cloud.sy = (Math.sin(rangle)*r);
		cloud.ey = cloud.sy;
		cloud.ex = cloud.sx*-1;
		cloud.width = (Math.random()*cloudwidth)+(cloudwidth/2);
		cloud.color = "rgb("+Math.abs(base.red-100)+","+Math.abs(base.green-100)+","+Math.abs(base.blue-100)+")";
		lines.push(cloud);
		rangle += Math.random()*(Math.PI/2)
		
	}
	return lines;
}

function randomRockyPlanet(body){
	let size = body.size;
	let lines = [];
	let r = size/2;
	let center = {x:r,y:r};
	let cloudwidth = r/14
	let rangle = 0
	let base = splitRGB(body.color);
	let variance = 0;
	for(var i = 0; i < (Math.random()*8)+4;i++){
		let cloud = {};
		variance = Math.random()*r;
		rangle = Math.random()*Math.PI*2;
		cloud.sx = (Math.cos(rangle)*variance);
		cloud.sy = (Math.sin(rangle)*variance);
		rangle = Math.random()*Math.PI*2;
		variance = Math.random()*r;
		let darkness = Math.round(Math.random()*100)
		cloud.ey = (Math.cos(rangle)*variance);
		cloud.ex = (Math.sin(rangle)*variance);
		cloud.width = (Math.random()*cloudwidth)+(cloudwidth/2);
		cloud.color = "rgb("+Math.abs(base.red-darkness)+","+Math.abs(base.green-darkness)+","+Math.abs(base.blue-darkness)+")";
		lines.push(cloud);
		rangle += Math.random()*(Math.PI/2)
		
	}
	return lines;
}

var airResistance = 0;
var gravity = 0;
var g = 0.00667; //gravitational constant
var starmin = 1000; //mass at which stars form
var starmax = 20000; //mass at which a star collapses from sheer mass
var tidalmin = 0.002; //force at which planets are ripped apart from acceleration
var explodemin = 20; //minimum fragment size from explosions
var explodeSpeed = 1; //force multiplier

class Body {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.xVel = 0;
        this.yVel = 0;
        this.bouncyness = 0.5;
        this.mass = 10;
        this.size = 10;
        this.color = "rgb("+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+","+Math.floor(Math.random()*255)+")";
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
		this.angle = Math.random()*Math.PI*2;
		this.angularMomentum = (Math.random()/100)-(0.005);
		this.texture = [];
		this.type = "none"
	}

    explode(other,force,density) { //creates explosion, deleting the original planet
        if (force == null)
			force = 0.2;
		if (density == null)
			density = this.density;
		
		this.delete = true;
		let parts = Math.floor(Math.random()*10)+2;
		if (this.mass/parts < explodemin)
			parts = 2;
		if (this.mass > starmin)
			parts = Math.floor(Math.random()*20)+2
		//var plane = angle(this,other)
		let n = normalize({"x":this.x-other.x,"y":this.y-other.y});
		let refang = dotProduct({"x":this.xVel,"y":this.yVel},n)
		let r = {"x":this.xVel-(2*refang.x*n.x*n.x),"y":this.yVel-(2*refang.y*n.y*n.y)}
		let tvel = Math.sqrt((this.xVel*this.xVel)+(this.yVel*this.yVel))
		//if (other == this)
			//r = {"x":0,"y":0};
		r = normalize(r);
		let totalmass = this.mass;
		let avgmass = this.mass/parts;
		let i = 0;
		while (i++ < parts) {
			let m = Math.floor(avgmass + ((Math.random()*avgmass)-(avgmass/2)));
			if (m > totalmass)
				m = totalmass;
			totalmass -= m;
			let temp = new Body(this.x,this.y);
			temp.invincibilityCooldown = 20;
			temp.mass = m;
			let newxvel = r.x*tvel+((Math.random()*force)-(force/2));
			let newyvel = r.y*tvel+((Math.random()*force)-(force/2));
			temp.xVel = newxvel;
			temp.yVel = newyvel;
			temp.color = this.color;
			temp.density = density;
			v.bodies.push(temp);
			if (totalmass <= 0)
				return;
		}
		if (totalmass != 0) {
			let temp = new Body(this.x,this.y);
			temp.invincibilityCooldown = 20;
			temp.mass = totalmass;
			let newxvel = r.x*tvel+((Math.random()*tvel/5)-tvel/10);
			let newyvel = r.y*tvel+((Math.random()*tvel/5)-tvel/10);
			temp.xVel = newxvel;
			temp.yVel = newyvel;
			temp.color = this.color;
			temp.density = density;
			v.bodies.push(temp);
		}


	}

	texturize(){
		if (this.density < 0.5) {
			this.type = "gasgiant";
			this.texture = randomGasGiant(this);
		} else if (this.density < 2) {
			this.type = "lightrock";
			this.texture = randomRockyPlanet(this);
		} else if (this.density >= 2) {
				this.type = "heavyrock";
			this.texture = [];
		}
	}

    shedMass(smass,force,density) { //creates explosion but leaves the planet behind
        let parts = Math.floor(Math.random()*10)+5;
		let avgmass = this.mass/parts;
		this.mass -= smass;
		for (let i = 0; i < 100; i++) {
			let m = Math.floor(avgmass + ((Math.random()*avgmass)-(avgmass/2)));
			if (m > smass)
				m = smass;
			smass -= m;
			let temp = new Body(this.x,this.y);
			temp.invincibilityCooldown = 60;
			temp.mass = m;
			let newxvel = this.xVel+((Math.random()*force)-(force/2));
			let newyvel = this.yVel+((Math.random()*force)-(force/2));
			temp.xVel = newxvel;
			temp.yVel = newyvel;
			//temp.color = this.color;
			temp.density = density;
			v.bodies.push(temp);
			if (smass <= 0){
				this.texturize()
				return;
			}
		}
		this.texturize()

	}

    collide(other) { //handle combining collision
        var totalmass = this.mass + other.mass
        var myportion = this.mass/totalmass
        var otherportion = other.mass/totalmass
        this.xVel = ((this.xVel*myportion) + (other.xVel*otherportion))/2
        this.yVel = ((this.yVel*myportion) + (other.yVel*otherportion))/2
		this.mass += other.mass;
		this.density = Math.round(((this.density*myportion)+(other.density*otherportion))*100)/100
		this.size = Math.sqrt((this.mass/this.density)/Math.PI)
		this.angularMomentum = (this.angularMomentum*myportion)+(other.angularMomentum*otherportion)
		this.texturize();
    }

    move() { //handle velocity physics tick
		if (this.delete)
            return;
        this.y += this.yVel;
        this.x += this.xVel;
		this.yVel += gravity;
		this.angle += this.angularMomentum;
    }

	update() { //physics tick
		for (let k in this)
			if (Number.isNaN(this[k]))
				this.delete = true;
        if (this.delete)
			return;
		this.size = Math.sqrt((this.mass/this.density)/Math.PI)
		if (this.mass > starmin) { //star formation
			this.type = "star";
			this.texture = [];
			var percent = this.mass/(starmax-starmin);
			var red = Math.round(255*percent);
			var blue = Math.round((1-percent)*255);
			var green = Math.round(this.density*200);
			red = red+green;
			blue = blue+green;
			this.color = "rgb("+red+","+green+","+blue+")";
			this.density += 0.000001;// burning fuel
			if (this.density < 4) {
				if (this.mass > starmax/2)
					this.density += 0.000005
				if (this.mass > starmax)
					this.density += 0.00002
				if (this.density >= 1 && this.density < 1.05) {
					this.density = 1.1; //stage 2 material
					this.explode(this,0.1,1.1);
				}
			}
			if (this.density >= 2 && this.density < 2.05) {
				this.density = 4;//stage 3 material
				this.shedMass(Math.round(this.mass/5),1,0.1); // create black hole
			}

			if (this.density > 3.5 && this.mass > 1000) {
				if (Math.random() > 0.99)
					this.shedMass(Math.round(this.mass/100),6,0.1);
			} else if (this.density > 3.5) {
				if (Math.random() > 0.99)
					this.shedMass(10,6,this.density);
			}
			if (this.density > 3.5)
				this.color = "rgb(0,0,0)"; // colorize black holes
		}else{
			if (this.density < 1) {
				if (this.type != "gasgiant") {
					this.type = "gasgiant";
					this.texture = randomGasGiant(this);
				}
			} else if (this.density < 2) {
				if (this.type != "lightrock") {
					this.type = "lightrock";
					//this.texture = randomGasGiant(this);
				}
			} else if (this.density >= 2) {
				if (this.type != "heavyrock") {
					this.type = "heavyrock";
					//this.texture = randomGasGiant(this);
				}
			}
		}
		
        this.colliding = false;
		if (this.invincibilityCooldown < 1) {

            var speed = Math.sqrt((this.xVel*this.xVel)+(this.yVel*this.yVel));
			for (let body of v.bodies) {
				if (this.invincible && body.nuke)
					continue;
				if (body.invincible && this.nuke)
					continue;
				if (body.invincibilityCooldown > 0 || body.delete)
					continue;
				if (body.nuke || body.delete || this.delete)
					continue;
				if (body.x != this.x && body.y != this.y) {
					if (distance(body,this) < ((this.size/2)+(body.size/2)) && !this.collided) {
						this.colliding = true;
						if (this.nuke && !body.invincible && body.mass > explodemin) {
							this.delete = true;
							body.explode(this,body.size/5);
						}
						if (this.nuke)
							continue;

						var otherspeed = Math.sqrt((body.xVel*body.xVel)+(body.yVel*body.yVel));
						if (speed > explodeSpeed && this.mass > explodemin && !this.invincible && this.mass < starmin) {
							this.explode(body);
							return;
						} else if (otherspeed > explodeSpeed && body.mass > explodemin && !body.invincible && body.mass < starmin) {
							body.explode(this);
							return;
						} else {
							if (this.mass > body.mass || this.mass == body.mass) {
								if (!body.invincible && !body.nuke) {
									this.collide(body);
									body.delete = true;
									body.collided = true;
									this.collided = true;
								}
							} else if (this.invincible) {
								let vel = body.angularMomentum*(distance(this,body))
								this.xVel = body.xVel + (vel*Math.cos(body.angle))
								this.yVel = body.yVel + (vel*Math.sin(body.angle))
								
							}
						}
					} else {
						var r = distance(this,body);
						var f = ((g*((/*this.mass**/body.mass)/(r*r))))//gravitational force
						var xoff = Math.abs(this.x-body.x)
						var yoff = Math.abs(this.y-body.y)
						var toff = xoff+yoff;

						if (this.x < body.x) {
							this.xVel += f * (xoff/toff);
						} else {
							this.xVel += f * ((xoff*-1)/toff);
						}
						
						if (this.y < body.y) {
							this.yVel += f * (yoff/toff);
						} else {
							this.yVel += f * ((yoff*-1)/toff);
						}

						if (f > (tidalmin+this.density) && this.mass > explodemin && (this.mass < starmin || body.density > 3) && this.shipId == null && !this.nuke)
							this.explode(body,1)
					}
				}
			}
			this.collided = false;
		} else
			this.invincibilityCooldown--;
    }
}

module.exports = Body;