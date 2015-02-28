HMU.World.Object3D = function() {
	THREE.Object3D.call(this);
}

HMU.World.Object3D.prototype = Object.create(THREE.Object3D.prototype);

HMU.World.Object3D.prototype.on = HMU.World.Object3D.prototype.addEventListener;

HMU.World.Object3D.prototype.bubble = function(event) {
	this.dispatchEvent(event);
	
	for(var i = 0; i < this.children.length; i++) {
		if(!this.children[i] || !this.children[i].bubble) continue;
		
		this.children[i].bubble(event);
	}
}

HMU.World.Object3D.prototype.tween = function(config) {
	var tween = new TWEEN.Tween(config.object || this);
	
	if(config.to && config.duration) {
		tween.to(config.to, config.duration);
	}
	
	if(config.easing) {
		tween.easing(config.easing);
	}
	
	var promise = new Promise(function(resolve, reject) {
		tween.onComplete(resolve);
		tween.onStop(resolve);
		tween.start(TWEEN._time);
	});
	
	promise.tween = tween;
	
	return promise;
}