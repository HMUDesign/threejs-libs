var HMU = HMU || {};

HMU.utils = {
	/**
	 * Given a base vector and a spread range vector, create
	 * a new THREE.Vector3 instance with randomised values.
	 * From ShaderParticleUtils
	 *
	 * @private
	 *
	 * @param  {THREE.Vector3} base
	 * @param  {THREE.Vector3} spread
	 * @return {THREE.Vector3}
	 */
	randomVector3: function( base, spread ) {
		var v = new THREE.Vector3();
		
		v.copy( base );
		
		v.x += Math.random() * spread.x - (spread.x/2);
		v.y += Math.random() * spread.y - (spread.y/2);
		v.z += Math.random() * spread.z - (spread.z/2);
		
		return v;
	},
	
	/**
	 * Given a base euler and a spread range euler, create
	 * a new THREE.Euler instance with randomised values.
	 * From ShaderParticleUtils::randomVector3
	 *
	 * @private
	 *
	 * @param  {THREE.Euler} base
	 * @param  {THREE.Euler} spread
	 * @return {THREE.Euler}
	 */
	randomEuler: function( base, spread ) {
		var v = new THREE.Euler();
		
		v.copy( base );
		
		v.x += Math.random() * spread.x - (spread.x / 2);
		v.y += Math.random() * spread.y - (spread.y / 2);
		v.z += Math.random() * spread.z - (spread.z / 2);
		
		return v;
	},
	
	/**
	 * Create a new THREE.Color instance and given a base vector and
	 * spread range vector, assign random values.
	 *
	 * Note that THREE.Color RGB values are in the range of 0 - 1, not 0 - 255.
	 *
	 * @private
	 *
	 * @param  {THREE.Vector3} base
	 * @param  {THREE.Vector3} spread
	 * @return {THREE.Color}
	 */
	randomColor: function( base, spread ) {
		var v = new THREE.Color();
		
		v.copy( base );
		
		v.r += (Math.random() * spread.x) - (spread.x/2);
		v.g += (Math.random() * spread.y) - (spread.y/2);
		v.b += (Math.random() * spread.z) - (spread.z/2);
		
		v.r = Math.max( 0, Math.min( v.r, 1 ) );
		v.g = Math.max( 0, Math.min( v.g, 1 ) );
		v.b = Math.max( 0, Math.min( v.b, 1 ) );
		
		return v;
	},
	
	/**
	 * Create a random Number value based on an initial value and
	 * a spread range
	 *
	 * @private
	 *
	 * @param  {Number} base
	 * @param  {Number} spread
	 * @return {Number}
	 */
	randomFloat: function( base, spread ) {
		return base + spread * (Math.random() - 0.5);
	},
};

HMU.Option = function(value, spread) {
	if(typeof value === 'string') {
		this.type = value;
		value = spread;
		spread = arguments[2];
	}
	else if(value instanceof THREE.Vector3) {
		this.type = 'Vector3';
	}
	else if(value instanceof THREE.Euler) {
		this.type = 'Euler';
	}
	else if(value instanceof THREE.Color) {
		this.type = 'Color';
	}
	else if(typeof value === 'number') {
		this.type = 'Number';
	}
	
	if(this.type === 'Vector3') {
		this.value  = value  instanceof THREE.Vector3 ? value  : new THREE.Vector3();
		this.spread = spread instanceof THREE.Vector3 ? spread : new THREE.Vector3();
	}
	else if(this.type === 'Euler') {
		this.value  = value  instanceof THREE.Euler ? value  : new THREE.Euler();
		this.spread = spread instanceof THREE.Euler ? spread : new THREE.Euler();
	}
	else if(this.type === 'Color') {
		this.value  = value  instanceof THREE.Color ? value  : new THREE.Color(0x000000);
		this.spread = spread instanceof THREE.Vector3 ? spread : new THREE.Vector3();
	}
	else if(this.type === 'Number') {
		this.value  = typeof value  === 'number' ? value  : 0;
		this.spread = typeof spread === 'number' ? spread : 0;
	}
	else {
		throw new Error('Unknown type ' + this.type);
	}
}

HMU.Option.prototype.get = function() {
	if(this.type === 'Vector3') {
		return HMU.utils.randomVector3(this.value, this.spread);
	}
	if(this.type === 'Euler') {
		return HMU.utils.randomEuler(this.value, this.spread);
	}
	if(this.type === 'Color') {
		return HMU.utils.randomColor(this.value, this.spread);
	}
	else if(this.type === 'Number') {
		return HMU.utils.randomFloat(this.value, this.spread);
	}
	else {
		throw new Error('Unknown type ' + this.type);
	}
}

HMU.utils.CylinderGeometryUV = function(geometry) {
	geometry.faceVertexUvs = [[]];
	
	var side = 1;
	if(geometry.parameters.openEnded === false) {
		side = geometry.parameters.height / (geometry.parameters.height + 2 * Math.max(geometry.parameters.radiusTop, geometry.parameters.radiusBottom));
	}
	
	for(var x = 0; x < geometry.parameters.radialSegments; x++ ) {
		var u1 = x / geometry.parameters.radialSegments;
		var u2 = (x + 1) / geometry.parameters.radialSegments;
		
		for(var y = 0; y < geometry.parameters.heightSegments; y++) {
			var v1 = y / geometry.parameters.heightSegments;
			var v2 = (y + 1) / geometry.parameters.heightSegments;
			
			// 1 4
			// 2 3
			var uv1 = new THREE.Vector2(u1, v1 * side);
			var uv2 = new THREE.Vector2(u1, v2 * side);
			var uv3 = new THREE.Vector2(u2, v2 * side);
			var uv4 = new THREE.Vector2(u2, v1 * side);
			
			geometry.faceVertexUvs[0].push([ uv1.clone(), uv2.clone(), uv4.clone() ]);
			geometry.faceVertexUvs[0].push([ uv2.clone(), uv3.clone(), uv4.clone() ]);
		}
	}
	
	// top cap
	if(geometry.parameters.openEnded === false && geometry.parameters.radiusTop > 0) {
		for(var x = 0; x < geometry.parameters.radialSegments; x++) {
			// -x + .5 to adjust texture map
			var u1 = -x / geometry.parameters.radialSegments + .5;
			var u2 = -(x + 1) / geometry.parameters.radialSegments + .5;
			
			var vertex1 = new THREE.Vector2(
				(Math.sin( u1 * Math.PI * 2 ) * .5 + .5) / 2,
				(Math.cos( u1 * Math.PI * 2 ) * .5 + .5) * (1 - side) + side
			);
			var vertex2 = new THREE.Vector2(
				(Math.sin( u2 * Math.PI * 2 ) * .5 + .5) / 2,
				(Math.cos( u2 * Math.PI * 2 ) * .5 + .5) * (1 - side) + side
			);
			var vertex3 = new THREE.Vector2(
				(0 * .5 + .5) / 2,
				(0 * .5 + .5) * (1 - side) + side
			);
			
			geometry.faceVertexUvs[0].push([ vertex1, vertex2, vertex3 ]);
		}
	}
	
	// bottom cap
	if(geometry.parameters.openEnded === false && geometry.parameters.radiusBottom > 0) {
		for(var x = 0; x < geometry.parameters.radialSegments; x++) {
			var u1 = x / geometry.parameters.radialSegments;
			var u2 = (x + 1) / geometry.parameters.radialSegments;
			
			var vertex2 = new THREE.Vector2(
				(Math.sin( u1 * Math.PI * 2 ) * .5 + .5) / 2 + .5,
				(Math.cos( u1 * Math.PI * 2 ) * .5 + .5) * (1 - side) + side
			);
			var vertex1 = new THREE.Vector2(
				(Math.sin( u2 * Math.PI * 2 ) * .5 + .5) / 2 + .5,
				(Math.cos( u2 * Math.PI * 2 ) * .5 + .5) * (1 - side) + side
			);
			var vertex3 = new THREE.Vector2(
				(0 * .5 + .5) / 2 + .5,
				(0 * .5 + .5) * (1 - side) + side
			);
			
			geometry.faceVertexUvs[0].push([ vertex1, vertex2, vertex3 ]);
		}
	}
}
