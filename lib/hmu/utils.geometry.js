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
