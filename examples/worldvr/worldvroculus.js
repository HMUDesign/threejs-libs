/*
 * Logic and API access inspired by:
 * https://github.com/toji/webvr-test/blob/master/index.html
 */

var WorldVROculus = function() {
	var vrconfig = this.vrconfig = new WorldVROculusConfig();
	
	this.add(this.camera);
	
	vrconfig.camera = this.camera;
	vrconfig.resize = this.resize.bind(this);
	
	var world = this;
	window.addEventListener('keydown', function(ev) {
		if(ev.keyCode == 13) { // enter key
			world.enableVR();
		}
		if(ev.keyCode == 'R'.charCodeAt(0)) {
			vrconfig.zeroSensor();
		}
		if(ev.keyCode == 187 || ev.keyCode == 61) { // '+' key
			vrconfig.resizeFOV(0.1);
			vrconfig.resize();
		}
		if(ev.keyCode == 189 || ev.keyCode == 173) { // '-' key
			vrconfig.resizeFOV(-0.1);
			vrconfig.resize();
		}
	});
	
	this.on('resize', function(e) {
		this.vrconfig.resizeFOV(0);
		if(this.vrconfig.vrMode) {
			e.width = this.vrconfig.renderTargetWidth;
			e.height = this.vrconfig.renderTargetHeight;
		}
	});
}

WorldVROculus.detect = function(callback) {
	if(navigator.getVRDevices || navigator.mozGetVRDevices) {
		return true;
	}
	
	if(WorldVROculus.debug) {
		return true;
	}
	
	return false;
}

WorldVROculus.prototype.enableVR = function() {
	this.vrconfig.vrMode = true;
	this.vrconfig.resizeFOV(0);
	
	if(this.debug) return;
	
	if(this.renderer.domElement.webkitRequestFullscreen) {
		this.renderer.domElement.webkitRequestFullscreen({ vrDisplay: this.vrconfig.deviceHMD });
	}
	else if(this.renderer.domElement.mozRequestFullScreen) {
		this.renderer.domElement.mozRequestFullScreen({ vrDisplay: this.vrconfig.deviceHMD });
	}
}

WorldVROculus.prototype.render = function() {
	this.vrconfig.updateVRDevice();
	
	var cameraPosition = this.camera.position.clone();
	this.camera.position.add(this.camera.vrshift);
	
	if(this.vrconfig.vrMode) {
		this.renderer.enableScissorTest(true);
		
		// Render left eye
		this.renderer.setScissor(0, 0, this.vrconfig.renderTargetWidth / 2, this.vrconfig.renderTargetHeight);
		this.renderer.setViewport(0, 0, this.vrconfig.renderTargetWidth / 2, this.vrconfig.renderTargetHeight);
		this.renderer.render(this.scene, this.vrconfig.cameraLeft);
		
		// Render right eye
		this.renderer.setScissor(this.vrconfig.renderTargetWidth / 2, 0, this.vrconfig.renderTargetWidth / 2, this.vrconfig.renderTargetHeight);
		this.renderer.setViewport(this.vrconfig.renderTargetWidth / 2, 0, this.vrconfig.renderTargetWidth / 2, this.vrconfig.renderTargetHeight);
		this.renderer.render(this.scene, this.vrconfig.cameraRight);
	}
	else {
		// Render mono view
		this.renderer.enableScissorTest(false);
		this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
		this.renderer.render(this.scene, this.camera);
	}
	
	this.camera.position.copy(cameraPosition);
}

var WorldVROculusConfig = function() {
	this.fovScale = 1;
	this.vrMode = false;
	this.renderTargetWidth = 1920;
	this.renderTargetHeight = 1080;
	
	var done = WorldVROculusConfig.EnumerateVRDevices.bind(this, function() {
		this.cameraLeft = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		this.cameraRight = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		
		this.camera.add(this.cameraLeft);
		this.camera.add(this.cameraRight);
		
		var eyeOffsetLeft = this.deviceHMD.getEyeTranslation('left');
		var eyeOffsetRight = this.deviceHMD.getEyeTranslation('right');
		
		this.cameraLeft.position.copy(eyeOffsetLeft);
		this.cameraRight.position.copy(eyeOffsetRight);
		
		this.camera.vrshift = new THREE.Vector3();
		
		this.resizeFOV(0);
		this.resize();
	});
	
	if(navigator.getVRDevices) {
		navigator.getVRDevices().then(done);
	}
	else if(navigator.mozGetVRDevices) {
		navigator.mozGetVRDevices(done);
	}
	else {
		setTimeout(done, 0);
	}
	
	function onFullscreenChange() {
		if(!document.webkitFullscreenElement && !document.mozFullScreenElement) {
			this.vrMode = false;
		}
		
		this.resize();
	}
	
	document.addEventListener('webkitfullscreenchange', onFullscreenChange.bind(this), false);
	document.addEventListener('mozfullscreenchange', onFullscreenChange.bind(this), false);
}

WorldVROculusConfig.EnumerateVRDevices = function(callback, devices) {
	if(WorldVROculus.debug && !devices) {
		function isLR(eye) { return eye === 'left' || eye === 'right'; }
		function switchLR(eye, left, right) { if(!isLR(eye)) throw new Error(); return eye === 'left' ? left : right; }
		
		this.debug = true;
		
		var data = {
			position: new THREE.Vector3(),
			orientation: new THREE.Quaternion(),
		};
		
		if('DeviceOrientationEvent' in window) {
			window.addEventListener('deviceorientation', function(e) {
				data.orientation.setFromEuler(new THREE.Euler(
					event.beta  * Math.PI / 180,
					event.gamma * Math.PI / 180,
					event.alpha * Math.PI / 180
				));
			}, false);
		}
		
		this.deviceHMD = {
			getEyeTranslation: function(eye) {
				var shift = 0.025;
				return new THREE.Vector3(switchLR(eye, -shift, shift), 0, 0);
			},
			setFieldOfView: function(fovLeft, fovRight) {
				data.fovLeft = fovLeft;
				data.fovRight = fovRight;
			},
			getRecommendedEyeFieldOfView: function(eye) {
				var u = 47.52769470214844;
				var v = 46.63209533691406;
				
				return {
					rightDegrees: switchLR(eye, u, v),
					leftDegrees: switchLR(eye, v, u),
					downDegrees: 53.04646682739258,
					upDegrees: 53.04646682739258,
				};
			},
			getCurrentEyeFieldOfView: function(eye) {
				return switchLR(eye,
					data.fovLeft || this.getRecommendedEyeFieldOfView(eye),
					data.fovRight || this.getRecommendedEyeFieldOfView(eye)
				);
			},
			getRecommendedEyeRenderRect: function(eye) {
				var width = window.innerWidth / 2;
				var height = window.innerHeight;
				
				return {
					width: width,
					height: height,
					
					left: switchLR(eye, 0, width),
					right: switchLR(eye, width, width * 2),
					top: 0,
					bottom: height,
					x: switchLR(eye, 0, width),
					y: 0,
				}
			},
		};
		
		this.deviceSensor = {
			zeroSensor: function() { console.log('deviceSensor.zeroSensor not supported in DEBUg mode.') },
			getState: function() {
				return {
					position: data.position,
					orientation: data.orientation,
				};
			},
		};
		
		return callback.call(this);
	}
	
	// First find an HMD device
	for(var i = 0; i < devices.length; ++i) {
		if(devices[i] instanceof HMDVRDevice) {
			this.deviceHMD = devices[i];
			break;
		}
	}
	
	// Next find a sensor that matches the HMD hardwareUnitId
	for(var i = 0; i < devices.length; ++i) {
		if(devices[i] instanceof PositionSensorVRDevice &&
			(!this.deviceHMD || devices[i].hardwareUnitId == this.deviceHMD.hardwareUnitId)
		) {
			this.deviceSensor = devices[i];
			break;
		}
	}
	
	return callback.call(this);
}

WorldVROculusConfig.PerspectiveMatrixFromVRFieldOfView = function(fov, zNear, zFar) {
	var upTan = Math.tan(fov.upDegrees * Math.PI/180.0);
	var downTan = Math.tan(fov.downDegrees * Math.PI/180.0);
	var leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0);
	var rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0);
	
	var xScale = 2.0 / (leftTan + rightTan);
	var yScale = 2.0 / (upTan + downTan);
	
	var outMat = new THREE.Matrix4();
	var out = outMat.elements;
	
	out[0] = xScale;
	out[4] = 0.0;
	out[8] = -((leftTan - rightTan) * xScale * 0.5);
	out[12] = 0.0;
	
	out[1] = 0.0;
	out[5] = yScale;
	out[9] = ((upTan - downTan) * yScale * 0.5);
	out[13] = 0.0;
	
	out[2] = 0.0;
	out[6] = 0.0;
	out[10] = zFar / (zNear - zFar);
	out[14] = (zFar * zNear) / (zNear - zFar);
	
	out[3] = 0.0;
	out[7] = 0.0;
	out[11] = -1.0;
	out[15] = 0.0;
	
	return outMat;
}

WorldVROculusConfig.prototype.zeroSensor = function() {
	this.deviceSensor.zeroSensor();
}

WorldVROculusConfig.prototype.resizeFOV = function(amount) {
	this.fovScale += amount;
	this.fovScale = Math.max(this.fovScale, .1);
	
	var fovLeft, fovRight;
	
	if('setFieldOfView' in this.deviceHMD) {
		fovLeft = this.deviceHMD.getRecommendedEyeFieldOfView('left');
		fovRight = this.deviceHMD.getRecommendedEyeFieldOfView('right');
		
		fovLeft.upDegrees *= this.fovScale;
		fovLeft.downDegrees *= this.fovScale;
		fovLeft.leftDegrees *= this.fovScale;
		fovLeft.rightDegrees *= this.fovScale;
		
		fovRight.upDegrees *= this.fovScale;
		fovRight.downDegrees *= this.fovScale;
		fovRight.leftDegrees *= this.fovScale;
		fovRight.rightDegrees *= this.fovScale;
		
		this.deviceHMD.setFieldOfView(fovLeft, fovRight);
	}
	
	if('getRecommendedEyeRenderRect' in this.deviceHMD) {
		var leftEyeViewport = this.deviceHMD.getRecommendedEyeRenderRect('left');
		var rightEyeViewport = this.deviceHMD.getRecommendedEyeRenderRect('right');
		this.renderTargetWidth = leftEyeViewport.width + rightEyeViewport.width;
		this.renderTargetHeight = Math.max(leftEyeViewport.height, rightEyeViewport.height);
	}
	
	if('getCurrentEyeFieldOfView' in this.deviceHMD) {
		fovLeft = this.deviceHMD.getCurrentEyeFieldOfView('left');
		fovRight = this.deviceHMD.getCurrentEyeFieldOfView('right');
	}
	else {
		fovLeft = this.deviceHMD.getRecommendedEyeFieldOfView('left');
		fovRight = this.deviceHMD.getRecommendedEyeFieldOfView('right');
	}
	
	this.cameraLeft.projectionMatrix = WorldVROculusConfig.PerspectiveMatrixFromVRFieldOfView(fovLeft, 0.1, 1000);
	this.cameraRight.projectionMatrix = WorldVROculusConfig.PerspectiveMatrixFromVRFieldOfView(fovRight, 0.1, 1000);
}

WorldVROculusConfig.prototype.updateVRDevice = function() {
	var vrState = this.deviceSensor.getState();
	
	if(vrState.position) {
		this.camera.vrshift.copy(vrState.position);
	}
	
	if(vrState.orientation) {
		this.camera.quaternion.copy(vrState.orientation);
	}
}
