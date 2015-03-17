HMU.World.Mesh = (function() {
	var Mesh = function() {
		THREE.Mesh.call(this);
	}
	
	Mesh.prototype = Object.create(THREE.Mesh.prototype);
	
	Mesh.prototype.on = Mesh.prototype.addEventListener;
	
	Mesh.prototype.bubble = function(event) {
		this.dispatchEvent(event);
		
		for(var i = 0; i < this.children.length; i++) {
			if(!this.children[i] || !this.children[i].bubble) continue;
			
			this.children[i].bubble(event);
		}
	}
	
	Mesh.prototype.tween = function(config) {
		var tween = new TWEEN.Tween(config.object || this);
		
		if(config.to && config.duration) {
			tween.to(config.to, config.duration);
		}
		
		if(config.easing) {
			if(config.easing.constructor === Array) {
				config.easing = TWEEN.Easing[config.easing[0]][config.easing[1]];
			}
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
	
	return Mesh;
})();