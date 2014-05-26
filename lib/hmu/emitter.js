HMU.Emitter = function(options) {
	options = options || {};
	
	THREE.Object3D.call(this);
	
	this.particles = [];
	this.spawning  = typeof options.spawning === 'undefined' ? true : !!options.spawning;
	
	this.config = {};
	
	this.config.particle  = options.particle;
	this.config.duration  = options.duration || 5;
	this.config.particles = options.particles || 100;
	
	this.config.rotation            = options.rotation            instanceof HMU.Option ? options.rotation            : new HMU.Option(new THREE.Euler(), new THREE.Euler(2 * Math.PI, 2 * Math.PI, 2 * Math.PI));
	this.config.angularVelocity     = options.angularVelocity     instanceof HMU.Option ? options.angularVelocity     : new HMU.Option('Euler');
	this.config.angularAcceleration = options.angularAcceleration instanceof HMU.Option ? options.angularAcceleration : new HMU.Option('Euler');
	
	this.config.position     = options.position     instanceof HMU.Option ? options.position     : new HMU.Option('Vector3');
	this.config.velocity     = options.velocity     instanceof HMU.Option ? options.velocity     : new HMU.Option('Vector3');
	this.config.acceleration = options.acceleration instanceof HMU.Option ? options.acceleration : new HMU.Option('Vector3');
	
	this.config.scaleStart = options.scaleStart instanceof HMU.Option ? options.scaleStart : new HMU.Option(1);
	this.config.scaleEnd   = options.scaleEnd   instanceof HMU.Option ? options.scaleEnd   : null;
	
//	this.config.opacityStart = options.opacityStart instanceof HMU.Option ? options.opacityStart : new HMU.Option(1);
//	this.config.opacityEnd   = options.opacityEnd   instanceof HMU.Option ? options.opacityEnd   : this.config.opacityStart;
	
	// private
	this._deltaRemainder = 0;
}

HMU.Emitter.prototype = Object.create(THREE.Object3D.prototype);

HMU.Emitter.prototype.reset = function() {
	for(var i = 0; i < this.particles.length; i++) {
		this.remove(this.particles[i]);
	}
	this.particles = [];
}

HMU.Emitter.prototype.tick = function(delta) {
	this.particles = this.particles.filter(function(particle) {
		particle.life -= delta;
		if(particle.life > 0) {
			return true;
		}
		else {
			this.remove(particle);
			return false;
		}
	}, this);
	
	if(this.spawning && this.particles.length < this.config.particles) {
		var needed = (this.config.particles / this.config.duration - 1) * Math.min(delta, 1) + this._deltaRemainder;
		
		while(needed > 1) {
			var particle = this.config.particle.clone();
			particle.mass = this.config.particle.mass;
			
			particle.life = this.config.duration;
			
			particle.rotation.copy(this.config.rotation.get());
			particle.angularVelocity     = this.config.angularVelocity.get();
			particle.angularAcceleration = this.config.angularAcceleration.get();
			
			particle.position     = this.config.position.get();
			particle.velocity     = this.config.velocity.get();
			particle.acceleration = this.config.acceleration.get();
			
			particle.scale = this.config.scaleStart.get();
			if(this.config.scaleEnd) {
				particle.scaleSlope = this.config.scaleEnd.get().sub(particle.scale).divideScalar(this.config.duration);
			}
			
			this.particles.push(particle);
			this.add(particle);
			
			needed--;
		}
		
		this._deltaRemainder = needed;
	}
	
	for(var i = 0; i < this.particles.length; i++) {
		var particle = this.particles[i];
		
		particle.velocity.add(particle.acceleration.clone().multiplyScalar(delta).multiplyScalar(particle.mass || 1));
		particle.position.add(particle.velocity.clone().multiplyScalar(delta));
		
		particle.angularVelocity.x += particle.angularAcceleration.x * delta;
		particle.angularVelocity.y += particle.angularAcceleration.y * delta;
		particle.angularVelocity.z += particle.angularAcceleration.z * delta;
		
		particle.rotation.x += particle.angularVelocity.x * delta;
		particle.rotation.y += particle.angularVelocity.y * delta;
		particle.rotation.z += particle.angularVelocity.z * delta;
		
		if(particle.scaleSlope) {
			particle.scale.add(particle.scaleSlope.clone().multiplyScalar(delta));
		}
	}
}
