HMU.World.Object3D = (function() {
	var Object3D = function() {
		THREE.Object3D.call(this);
	}
	
	Object3D.prototype = Object.create(THREE.Object3D.prototype);
	
	Object3D.prototype.on = Object3D.prototype.addEventListener;
	
	Object3D.prototype.bubble = function(event) {
		this.dispatchEvent(event);
		
		for(var i = 0; i < this.children.length; i++) {
			if(!this.children[i] || !this.children[i].bubble) continue;
			
			this.children[i].bubble(event);
		}
	}
	
	Object3D.prototype.tween = function(config) {
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
	
	return Object3D;
})();