HMU.World.Extras = HMU.World.Extras || {};

HMU.World.Extras.Resize = (function() {
	var Resize = function(config) {
		window.addEventListener('resize', this.resize.bind(this), false);
		
		if(config.fov) {
			this.fov = typeof config.fov === 'object' ? config.fov : {};
			if(typeof this.fov !== 'object') this.fov = {};
			
			if(!this.fov.x) this.fov.x = 2 * THREE.Math.radToDeg(Math.atan(1 / 2));
			var width = 2 * Math.tan(THREE.Math.degToRad(this.fov.x / 2));
			
			if(!this.fov.y) this.fov.y = 2 * THREE.Math.radToDeg(Math.atan(width / 3));
			var height = 2 * Math.tan(THREE.Math.degToRad(this.fov.y / 2));
			
			if(this.fov.debug) {
				this.box = new THREE.Mesh(new THREE.BoxGeometry(width, height, 1), new THREE.MeshBasicMaterial({ wireframe: true }));
				this.box.name = 'FOV Helper';
				this.box.position.set(0, 0, -1.5);
				this.camera.add(this.box);
			}
		}
		
		setTimeout(this.resize.bind(this), 0);
	}
	
	Resize.prototype.resize = function() {
		var event = {
			type: 'resize',
			width: document.body.clientWidth || window.innerWidth,
			height: window.innerHeight,
		};
		
		this.bubble(event);
		
		this.camera.aspect = event.width / event.height;
		
		if(this.fov) {
			this.camera.fov = this.fov.y;
			
			var height = 2 * Math.tan(THREE.Math.degToRad(this.fov.y / 2));
			var _fovx = THREE.Math.radToDeg(2 * Math.atan(height * this.camera.aspect / 2));
			
			if(_fovx < this.fov.x) {
				var width = 2 * Math.tan(THREE.Math.degToRad(this.fov.x / 2));
				var _fovy = THREE.Math.radToDeg(2 * Math.atan(width / this.camera.aspect / 2));
				this.camera.fov = _fovy;
			}
		}
		
		this.camera.updateProjectionMatrix();
		
		this.renderer.setSize(event.width, event.height);
	}
	
	return Resize;
})();
