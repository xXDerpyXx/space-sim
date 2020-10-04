class Player{
	constructor(id){
		this.id = id;
		this.accelerating = false;
		this.decelerating = false;
		this.acceleration = 0;
		this.throttle = 1;
		this.direction = 0;
		this.rotatingLeft = false;
		this.rotatingRight = false;
		this.ship = null;
		this.lastJump = 0;
	}
}

module.exports = Player;