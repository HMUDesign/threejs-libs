HMU.Swarm = function(options) {
	options = options || {};
	
	THREE.Object3D.call(this);
	
	this.drones = [];
}

HMU.Swarm.prototype = Object.create(THREE.Object3D.prototype);

HMU.Swarm.prototype.tick = function(delta) {
	for(var i = 0; i < this.drones.length; i++) {
		var drone = this.drones[i];
		drone.tick();
	}
}


HMU.Drone = function(options) {
	options = options || {};
	
	THREE.Object3D.call(this);
	
	this.behaviours = [];
}

HMU.Drone.prototype = Object.create(THREE.Object3D.prototype);

HMU.Drone.prototype.tick = function(delta) {
	for(var i = 0; i < this.behaviours.length; i++) {
		var behaviour = this.behaviours[i];
		
		// apply behaviour
	}
}


HMU.Drone.Behaviours = {};


