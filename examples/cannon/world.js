/**
 * World
 */
PROJECT.World = function() {
	HMU.World.call(this, {
		camera: new THREE.Vector3(0, 0, 10),
	});
	
	this.build();
	
	this.frames = 0;
	this.on('update', function(e) {
		if(this.frames % 30 === 0) this.drop();
		this.frames++;
		
		this.cannon.step(1 / 60); // e.delta not repeatable
		
		for(var i = 0; i < this.balls.length; i++) {
			var ball = this.balls[i];
			
			ball.cannon.position.z = 0;
			ball.cannon.velocity.z = 0;
			
			ball.position.copy(ball.cannon.position);
			
			var q = ball.cannon.quaternion;
			ball.quaternion.set(q.x, q.y, q.z, q.w);
			
//			if(ball.position.y < -13) {
//				ball.destroy();
//			}
		}
		
		this.balls = this.balls.filter(function(ball) {
			return ball.parent ? true : false;
		});
	});
}

PROJECT.World.prototype = Object.create(HMU.World.prototype);

PROJECT.World.prototype.build = function() {
	this.cannon = new CANNON.World();
	this.cannon.gravity.set(0, -9.8, 0);
	this.cannon.broadphase = new CANNON.NaiveBroadphase();
	
	this.cannon.addContactMaterial(new CANNON.ContactMaterial(PROJECT.Ball.cannon_mat, PROJECT.Ball.cannon_mat, { friction: 0.3, restitution: 0.75 }));
	this.cannon.addContactMaterial(new CANNON.ContactMaterial(PROJECT.Ball.cannon_mat, PROJECT.Pin.cannon_mat, { friction: 0.3, restitution: 0.75 }));
	this.cannon.addContactMaterial(new CANNON.ContactMaterial(PROJECT.Ball.cannon_mat, PROJECT.Boundary.cannon_mat, { friction: 0.3, restitution: 0.75 }));
	
	this.ceiling = new PROJECT.Boundary(new THREE.Vector3(0, 7, 0), new THREE.Euler(Math.PI / 2, 0, 0));
	this.add(this.ceiling);
	this.cannon.add(this.ceiling.cannon);
	
	this.ground = new PROJECT.Boundary(new THREE.Vector3(0, -7, 0), new THREE.Euler(- Math.PI / 2, 0, 0));
	this.add(this.ground);
	this.cannon.add(this.ground.cannon);
	
	this.left = new PROJECT.Boundary(new THREE.Vector3(-9, -7, 0), new THREE.Euler(- Math.PI / 2, Math.PI / 2, 0));
	this.add(this.left);
	this.cannon.add(this.left.cannon);
	
	this.right = new PROJECT.Boundary(new THREE.Vector3(9, -7, 0), new THREE.Euler(- Math.PI / 2, -Math.PI / 2, 0));
	this.add(this.right);
	this.cannon.add(this.right.cannon);
	
	var w = 1, h = .75;
	
	this.balls = [];
	
	this.pins = [];
	var yoff = (16 + 2) * h / 2;
	for(var row = 0; row < 16; row++) {
		var count = 16 + row % 2;
		var xoff = (count - 1) * w / 2;
		for(var col = 0; col < count; col++) {
			if(row === 0 && (col === 7 || col === 8)) continue;
			if(row === 1 && (col === 8)) continue;
			
			var pin = new PROJECT.Pin();
			
			pin.position.copy(new THREE.Vector3(
				col * w - xoff,
				- row * h - h + yoff,
				0
			));
			
			pin.cannon.position.set(pin.position.x, pin.position.y, pin.position.z);
			this.cannon.add(pin.cannon);
			
			this.pins.push(pin);
			this.add(pin);
		}
	}
}

PROJECT.World.prototype.drop = function() {
	var ball = new PROJECT.Ball();
	ball.position.y = 6;
	
	ball.cannon.position.set(ball.position.x, ball.position.y, ball.position.z);
	ball.cannon.velocity.x = (Math.random() - .5) * 5;
	if(Math.random() < .25) ball.cannon.velocity.x = 0;
	
	var i = 0;
	ball.cannon.addEventListener('collide', function(e) {
		
	});
	
	this.cannon.add(ball.cannon);
	
	this.balls.push(ball);
	this.add(ball);
}

window.onload = function() {
	this.world = new PROJECT.World();
	
	window.addEventListener('keydown', function(e) {
		if(e.keyCode === 32) {
			this.world.drop();
		}
	});
}
