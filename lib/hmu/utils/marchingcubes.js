HMU.MarchingCubes = (function() {
	var loader;
	
	var MarchingCubes = function(density, start, end, resolution) {
		THREE.Geometry.call(this);
		
		var width  = end.x - start.x;
		var height = end.y - start.y;
		var depth  = end.z - start.z;
		
		if(width  / resolution % 1) throw new Error('MarchingCubes: Width is not divisible by Resolution');
		if(height / resolution % 1) throw new Error('MarchingCubes: Height is not divisible by Resolution');
		if(depth  / resolution % 1) throw new Error('MarchingCubes: Depth is not divisible by Resolution');
		
		var stepW = width  / resolution;
		var stepH = height / resolution;
		var stepD = depth  / resolution;
		
		for(var w = 0; w < stepW; w++) {
			for(var h = 0; h < stepH; h++) {
				for(var d = 0; d < stepD; d++) {
					// get position of corners
					var o000 = new THREE.Vector3(w    , h    , d    );
					var o001 = new THREE.Vector3(w    , h    , d + 1);
					var o010 = new THREE.Vector3(w    , h + 1, d    );
					var o011 = new THREE.Vector3(w    , h + 1, d + 1);
					var o100 = new THREE.Vector3(w + 1, h    , d    );
					var o101 = new THREE.Vector3(w + 1, h    , d + 1);
					var o110 = new THREE.Vector3(w + 1, h + 1, d    );
					var o111 = new THREE.Vector3(w + 1, h + 1, d + 1);
					
					var p000 = o000.clone().multiplyScalar(resolution).add(start);
					var p001 = o001.clone().multiplyScalar(resolution).add(start);
					var p010 = o010.clone().multiplyScalar(resolution).add(start);
					var p011 = o011.clone().multiplyScalar(resolution).add(start);
					var p100 = o100.clone().multiplyScalar(resolution).add(start);
					var p101 = o101.clone().multiplyScalar(resolution).add(start);
					var p110 = o110.clone().multiplyScalar(resolution).add(start);
					var p111 = o111.clone().multiplyScalar(resolution).add(start);
					
					// get density at corners
					var d000 = density(p000, o000);
					var d001 = density(p001, o001);
					var d010 = density(p010, o010);
					var d011 = density(p011, o011);
					var d100 = density(p100, o100);
					var d101 = density(p101, o101);
					var d110 = density(p110, o110);
					var d111 = density(p111, o111);
					
					// generate bitmask
					var bitmask = 0;
					if(d000 > 0) bitmask |= 1;
					if(d010 > 0) bitmask |= 2;
					if(d110 > 0) bitmask |= 4;
					if(d100 > 0) bitmask |= 8;
					if(d001 > 0) bitmask |= 16;
					if(d011 > 0) bitmask |= 32;
					if(d111 > 0) bitmask |= 64;
					if(d101 > 0) bitmask |= 128;
					
					// quick exit
					if(bitmask === 0 || bitmask === 255) continue;
					
					// lookup bitmask
					var triangles = MarchingCubes.triangles[bitmask];
					
					// generate edge vertices
					function vertex(edge) {
						// front edges
						if(edge === 0) {
							var output = p000.clone();
							output.y += resolution * ilerp(0, d000, d010);
							return output;
						}
						if(edge === 1) {
							var output = p010.clone();
							output.x += resolution * ilerp(0, d010, d110);
							return output;
						}
						if(edge === 2) {
							var output = p100.clone();
							output.y += resolution * ilerp(0, d100, d110);
							return output;
						}
						if(edge === 3) {
							var output = p000.clone();
							output.x += resolution * ilerp(0, d000, d100);
							return output;
						}
						
						// back edges
						if(edge === 4) {
							var output = p001.clone();
							output.y += resolution * ilerp(0, d001, d011);
							return output;
						}
						if(edge === 5) {
							var output = p011.clone();
							output.x += resolution * ilerp(0, d011, d111);
							return output;
						}
						if(edge === 6) {
							var output = p101.clone();
							output.y += resolution * ilerp(0, d101, d111);
							return output;
						}
						if(edge === 7) {
							var output = p001.clone();
							output.x += resolution * ilerp(0, d001, d101);
							return output;
						}
						
						// side edges
						if(edge === 8) {
							var output = p000.clone();
							output.z += resolution * ilerp(0, d000, d001);
							return output;
						}
						if(edge === 9) {
							var output = p010.clone();
							output.z += resolution * ilerp(0, d010, d011);
							return output;
						}
						if(edge === 10) {
							var output = p110.clone();
							output.z += resolution * ilerp(0, d110, d111);
							return output;
						}
						if(edge === 11) {
							var output = p100.clone();
							output.z += resolution * ilerp(0, d100, d101);
							return output;
						}
						
						throw new Error('MarchingCubes: Vertex(edge, ...): Edge out of bounds. Must be 0-11. Provided: ' + edge)
					}
					
					for(var t = 0; t < triangles.length; t++) {
						var face = new THREE.Face3();
						
						face.a = this.vertices.push(vertex(triangles[t][0])) - 1;
						face.b = this.vertices.push(vertex(triangles[t][1])) - 1;
						face.c = this.vertices.push(vertex(triangles[t][2])) - 1;
						
						this.faces.push(face);
					}
				}
			}
		}
		
		this.computeFaceNormals();
	};
	
	// lerp
	function lerp(t, a, b) { return a + t * (b - a); }
	// inverse lerp
	function ilerp(t, a, b) { return (t - a) / (b - a); }
	
	MarchingCubes.prototype = Object.create(THREE.Geometry.prototype);
	
	return MarchingCubes;
})();

HMU.MarchingCubes.triangles = (function() {
	return [
		[],
		[ [0,8,3] ],
		[ [0,1,9] ],
		[ [1,8,3], [9,8,1] ],
		[ [1,2,10] ],
		[ [0,8,3], [1,2,10] ],
		[ [9,2,10], [0,2,9] ],
		[ [2,8,3], [2,10,8], [10,9,8] ],
		[ [3,11,2] ],
		[ [0,11,2], [8,11,0] ],
		[ [1,9,0], [2,3,11] ],
		[ [1,11,2], [1,9,11], [9,8,11] ],
		[ [3,10,1], [11,10,3] ],
		[ [0,10,1], [0,8,10], [8,11,10] ],
		[ [3,9,0], [3,11,9], [11,10,9] ],
		[ [9,8,10], [10,8,11] ],
		[ [4,7,8] ],
		[ [4,3,0], [7,3,4] ],
		[ [0,1,9], [8,4,7] ],
		[ [4,1,9], [4,7,1], [7,3,1] ],
		[ [1,2,10], [8,4,7] ],
		[ [3,4,7], [3,0,4], [1,2,10] ],
		[ [9,2,10], [9,0,2], [8,4,7] ],
		[ [2,10,9], [2,9,7], [2,7,3], [7,9,4] ],
		[ [8,4,7], [3,11,2] ],
		[ [11,4,7], [11,2,4], [2,0,4] ],
		[ [9,0,1], [8,4,7], [2,3,11] ],
		[ [4,7,11], [9,4,11], [9,11,2], [9,2,1] ],
		[ [3,10,1], [3,11,10], [7,8,4] ],
		[ [1,11,10], [1,4,11], [1,0,4], [7,11,4] ],
		[ [4,7,8], [9,0,11], [9,11,10], [11,0,3] ],
		[ [4,7,11], [4,11,9], [9,11,10] ],
		[ [9,5,4] ],
		[ [9,5,4], [0,8,3] ],
		[ [0,5,4], [1,5,0] ],
		[ [8,5,4], [8,3,5], [3,1,5] ],
		[ [1,2,10], [9,5,4] ],
		[ [3,0,8], [1,2,10], [4,9,5] ],
		[ [5,2,10], [5,4,2], [4,0,2] ],
		[ [2,10,5], [3,2,5], [3,5,4], [3,4,8] ],
		[ [9,5,4], [2,3,11] ],
		[ [0,11,2], [0,8,11], [4,9,5] ],
		[ [0,5,4], [0,1,5], [2,3,11] ],
		[ [2,1,5], [2,5,8], [2,8,11], [4,8,5] ],
		[ [10,3,11], [10,1,3], [9,5,4] ],
		[ [4,9,5], [0,8,1], [8,10,1], [8,11,10] ],
		[ [5,4,0], [5,0,11], [5,11,10], [11,0,3] ],
		[ [5,4,8], [5,8,10], [10,8,11] ],
		[ [9,7,8], [5,7,9] ],
		[ [9,3,0], [9,5,3], [5,7,3] ],
		[ [0,7,8], [0,1,7], [1,5,7] ],
		[ [1,5,3], [3,5,7] ],
		[ [9,7,8], [9,5,7], [10,1,2] ],
		[ [10,1,2], [9,5,0], [5,3,0], [5,7,3] ],
		[ [8,0,2], [8,2,5], [8,5,7], [10,5,2] ],
		[ [2,10,5], [2,5,3], [3,5,7] ],
		[ [7,9,5], [7,8,9], [3,11,2] ],
		[ [9,5,7], [9,7,2], [9,2,0], [2,7,11] ],
		[ [2,3,11], [0,1,8], [1,7,8], [1,5,7] ],
		[ [11,2,1], [11,1,7], [7,1,5] ],
		[ [9,5,8], [8,5,7], [10,1,3], [10,3,11] ],
		[ [5,7,0], [5,0,9], [7,11,0], [1,0,10], [11,10,0] ],
		[ [11,10,0], [11,0,3], [10,5,0], [8,0,7], [5,7,0] ],
		[ [11,10,5], [7,11,5] ],
		[ [10,6,5] ],
		[ [0,8,3], [5,10,6] ],
		[ [9,0,1], [5,10,6] ],
		[ [1,8,3], [1,9,8], [5,10,6] ],
		[ [1,6,5], [2,6,1] ],
		[ [1,6,5], [1,2,6], [3,0,8] ],
		[ [9,6,5], [9,0,6], [0,2,6] ],
		[ [5,9,8], [5,8,2], [5,2,6], [3,2,8] ],
		[ [2,3,11], [10,6,5] ],
		[ [11,0,8], [11,2,0], [10,6,5] ],
		[ [0,1,9], [2,3,11], [5,10,6] ],
		[ [5,10,6], [1,9,2], [9,11,2], [9,8,11] ],
		[ [6,3,11], [6,5,3], [5,1,3] ],
		[ [0,8,11], [0,11,5], [0,5,1], [5,11,6] ],
		[ [3,11,6], [0,3,6], [0,6,5], [0,5,9] ],
		[ [6,5,9], [6,9,11], [11,9,8] ],
		[ [5,10,6], [4,7,8] ],
		[ [4,3,0], [4,7,3], [6,5,10] ],
		[ [1,9,0], [5,10,6], [8,4,7] ],
		[ [10,6,5], [1,9,7], [1,7,3], [7,9,4] ],
		[ [6,1,2], [6,5,1], [4,7,8] ],
		[ [1,2,5], [5,2,6], [3,0,4], [3,4,7] ],
		[ [8,4,7], [9,0,5], [0,6,5], [0,2,6] ],
		[ [7,3,9], [7,9,4], [3,2,9], [5,9,6], [2,6,9] ],
		[ [3,11,2], [7,8,4], [10,6,5] ],
		[ [5,10,6], [4,7,2], [4,2,0], [2,7,11] ],
		[ [0,1,9], [4,7,8], [2,3,11], [5,10,6] ],
		[ [9,2,1], [9,11,2], [9,4,11], [7,11,4], [5,10,6] ],
		[ [8,4,7], [3,11,5], [3,5,1], [5,11,6] ],
		[ [5,1,11], [5,11,6], [1,0,11], [7,11,4], [0,4,11] ],
		[ [0,5,9], [0,6,5], [0,3,6], [11,6,3], [8,4,7] ],
		[ [6,5,9], [6,9,11], [4,7,9], [7,11,9] ],
		[ [10,4,9], [6,4,10] ],
		[ [4,10,6], [4,9,10], [0,8,3] ],
		[ [10,0,1], [10,6,0], [6,4,0] ],
		[ [8,3,1], [8,1,6], [8,6,4], [6,1,10] ],
		[ [1,4,9], [1,2,4], [2,6,4] ],
		[ [3,0,8], [1,2,9], [2,4,9], [2,6,4] ],
		[ [0,2,4], [4,2,6] ],
		[ [8,3,2], [8,2,4], [4,2,6] ],
		[ [10,4,9], [10,6,4], [11,2,3] ],
		[ [0,8,2], [2,8,11], [4,9,10], [4,10,6] ],
		[ [3,11,2], [0,1,6], [0,6,4], [6,1,10] ],
		[ [6,4,1], [6,1,10], [4,8,1], [2,1,11], [8,11,1] ],
		[ [9,6,4], [9,3,6], [9,1,3], [11,6,3] ],
		[ [8,11,1], [8,1,0], [11,6,1], [9,1,4], [6,4,1] ],
		[ [3,11,6], [3,6,0], [0,6,4] ],
		[ [6,4,8], [11,6,8] ],
		[ [7,10,6], [7,8,10], [8,9,10] ],
		[ [0,7,3], [0,10,7], [0,9,10], [6,7,10] ],
		[ [10,6,7], [1,10,7], [1,7,8], [1,8,0] ],
		[ [10,6,7], [10,7,1], [1,7,3] ],
		[ [1,2,6], [1,6,8], [1,8,9], [8,6,7] ],
		[ [2,6,9], [2,9,1], [6,7,9], [0,9,3], [7,3,9] ],
		[ [7,8,0], [7,0,6], [6,0,2] ],
		[ [7,3,2], [6,7,2] ],
		[ [2,3,11], [10,6,8], [10,8,9], [8,6,7] ],
		[ [2,0,7], [2,7,11], [0,9,7], [6,7,10], [9,10,7] ],
		[ [1,8,0], [1,7,8], [1,10,7], [6,7,10], [2,3,11] ],
		[ [11,2,1], [11,1,7], [10,6,1], [6,7,1] ],
		[ [8,9,6], [8,6,7], [9,1,6], [11,6,3], [1,3,6] ],
		[ [0,9,1], [11,6,7] ],
		[ [7,8,0], [7,0,6], [3,11,0], [11,6,0] ],
		[ [7,11,6] ],
		[ [7,6,11] ],
		[ [3,0,8], [11,7,6] ],
		[ [0,1,9], [11,7,6] ],
		[ [8,1,9], [8,3,1], [11,7,6] ],
		[ [10,1,2], [6,11,7] ],
		[ [1,2,10], [3,0,8], [6,11,7] ],
		[ [2,9,0], [2,10,9], [6,11,7] ],
		[ [6,11,7], [2,10,3], [10,8,3], [10,9,8] ],
		[ [7,2,3], [6,2,7] ],
		[ [7,0,8], [7,6,0], [6,2,0] ],
		[ [2,7,6], [2,3,7], [0,1,9] ],
		[ [1,6,2], [1,8,6], [1,9,8], [8,7,6] ],
		[ [10,7,6], [10,1,7], [1,3,7] ],
		[ [10,7,6], [1,7,10], [1,8,7], [1,0,8] ],
		[ [0,3,7], [0,7,10], [0,10,9], [6,10,7] ],
		[ [7,6,10], [7,10,8], [8,10,9] ],
		[ [6,8,4], [11,8,6] ],
		[ [3,6,11], [3,0,6], [0,4,6] ],
		[ [8,6,11], [8,4,6], [9,0,1] ],
		[ [9,4,6], [9,6,3], [9,3,1], [11,3,6] ],
		[ [6,8,4], [6,11,8], [2,10,1] ],
		[ [1,2,10], [3,0,11], [0,6,11], [0,4,6] ],
		[ [4,11,8], [4,6,11], [0,2,9], [2,10,9] ],
		[ [10,9,3], [10,3,2], [9,4,3], [11,3,6], [4,6,3] ],
		[ [8,2,3], [8,4,2], [4,6,2] ],
		[ [0,4,2], [4,6,2] ],
		[ [1,9,0], [2,3,4], [2,4,6], [4,3,8] ],
		[ [1,9,4], [1,4,2], [2,4,6] ],
		[ [8,1,3], [8,6,1], [8,4,6], [6,10,1] ],
		[ [10,1,0], [10,0,6], [6,0,4] ],
		[ [4,6,3], [4,3,8], [6,10,3], [0,3,9], [10,9,3] ],
		[ [10,9,4], [6,10,4] ],
		[ [4,9,5], [7,6,11] ],
		[ [0,8,3], [4,9,5], [11,7,6] ],
		[ [5,0,1], [5,4,0], [7,6,11] ],
		[ [11,7,6], [8,3,4], [3,5,4], [3,1,5] ],
		[ [9,5,4], [10,1,2], [7,6,11] ],
		[ [6,11,7], [1,2,10], [0,8,3], [4,9,5] ],
		[ [7,6,11], [5,4,10], [4,2,10], [4,0,2] ],
		[ [3,4,8], [3,5,4], [3,2,5], [10,5,2], [11,7,6] ],
		[ [7,2,3], [7,6,2], [5,4,9] ],
		[ [9,5,4], [0,8,6], [0,6,2], [6,8,7] ],
		[ [3,6,2], [3,7,6], [1,5,0], [5,4,0] ],
		[ [6,2,8], [6,8,7], [2,1,8], [4,8,5], [1,5,8] ],
		[ [9,5,4], [10,1,6], [1,7,6], [1,3,7] ],
		[ [1,6,10], [1,7,6], [1,0,7], [8,7,0], [9,5,4] ],
		[ [4,0,10], [4,10,5], [0,3,10], [6,10,7], [3,7,10] ],
		[ [7,6,10], [7,10,8], [5,4,10], [4,8,10] ],
		[ [6,9,5], [6,11,9], [11,8,9] ],
		[ [3,6,11], [0,6,3], [0,5,6], [0,9,5] ],
		[ [0,11,8], [0,5,11], [0,1,5], [5,6,11] ],
		[ [6,11,3], [6,3,5], [5,3,1] ],
		[ [1,2,10], [9,5,11], [9,11,8], [11,5,6] ],
		[ [0,11,3], [0,6,11], [0,9,6], [5,6,9], [1,2,10] ],
		[ [11,8,5], [11,5,6], [8,0,5], [10,5,2], [0,2,5] ],
		[ [6,11,3], [6,3,5], [2,10,3], [10,5,3] ],
		[ [5,8,9], [5,2,8], [5,6,2], [3,8,2] ],
		[ [9,5,6], [9,6,0], [0,6,2] ],
		[ [1,5,8], [1,8,0], [5,6,8], [3,8,2], [6,2,8] ],
		[ [1,5,6], [2,1,6] ],
		[ [1,3,6], [1,6,10], [3,8,6], [5,6,9], [8,9,6] ],
		[ [10,1,0], [10,0,6], [9,5,0], [5,6,0] ],
		[ [0,3,8], [5,6,10] ],
		[ [10,5,6] ],
		[ [11,5,10], [7,5,11] ],
		[ [11,5,10], [11,7,5], [8,3,0] ],
		[ [5,11,7], [5,10,11], [1,9,0] ],
		[ [10,7,5], [10,11,7], [9,8,1], [8,3,1] ],
		[ [11,1,2], [11,7,1], [7,5,1] ],
		[ [0,8,3], [1,2,7], [1,7,5], [7,2,11] ],
		[ [9,7,5], [9,2,7], [9,0,2], [2,11,7] ],
		[ [7,5,2], [7,2,11], [5,9,2], [3,2,8], [9,8,2] ],
		[ [2,5,10], [2,3,5], [3,7,5] ],
		[ [8,2,0], [8,5,2], [8,7,5], [10,2,5] ],
		[ [9,0,1], [5,10,3], [5,3,7], [3,10,2] ],
		[ [9,8,2], [9,2,1], [8,7,2], [10,2,5], [7,5,2] ],
		[ [1,3,5], [3,7,5] ],
		[ [0,8,7], [0,7,1], [1,7,5] ],
		[ [9,0,3], [9,3,5], [5,3,7] ],
		[ [9,8,7], [5,9,7] ],
		[ [5,8,4], [5,10,8], [10,11,8] ],
		[ [5,0,4], [5,11,0], [5,10,11], [11,3,0] ],
		[ [0,1,9], [8,4,10], [8,10,11], [10,4,5] ],
		[ [10,11,4], [10,4,5], [11,3,4], [9,4,1], [3,1,4] ],
		[ [2,5,1], [2,8,5], [2,11,8], [4,5,8] ],
		[ [0,4,11], [0,11,3], [4,5,11], [2,11,1], [5,1,11] ],
		[ [0,2,5], [0,5,9], [2,11,5], [4,5,8], [11,8,5] ],
		[ [9,4,5], [2,11,3] ],
		[ [2,5,10], [3,5,2], [3,4,5], [3,8,4] ],
		[ [5,10,2], [5,2,4], [4,2,0] ],
		[ [3,10,2], [3,5,10], [3,8,5], [4,5,8], [0,1,9] ],
		[ [5,10,2], [5,2,4], [1,9,2], [9,4,2] ],
		[ [8,4,5], [8,5,3], [3,5,1] ],
		[ [0,4,5], [1,0,5] ],
		[ [8,4,5], [8,5,3], [9,0,5], [0,3,5] ],
		[ [9,4,5] ],
		[ [4,11,7], [4,9,11], [9,10,11] ],
		[ [0,8,3], [4,9,7], [9,11,7], [9,10,11] ],
		[ [1,10,11], [1,11,4], [1,4,0], [7,4,11] ],
		[ [3,1,4], [3,4,8], [1,10,4], [7,4,11], [10,11,4] ],
		[ [4,11,7], [9,11,4], [9,2,11], [9,1,2] ],
		[ [9,7,4], [9,11,7], [9,1,11], [2,11,1], [0,8,3] ],
		[ [11,7,4], [11,4,2], [2,4,0] ],
		[ [11,7,4], [11,4,2], [8,3,4], [3,2,4] ],
		[ [2,9,10], [2,7,9], [2,3,7], [7,4,9] ],
		[ [9,10,7], [9,7,4], [10,2,7], [8,7,0], [2,0,7] ],
		[ [3,7,10], [3,10,2], [7,4,10], [1,10,0], [4,0,10] ],
		[ [1,10,2], [8,7,4] ],
		[ [4,9,1], [4,1,7], [7,1,3] ],
		[ [4,9,1], [4,1,7], [0,8,1], [8,7,1] ],
		[ [4,0,3], [7,4,3] ],
		[ [4,8,7] ],
		[ [9,10,8], [10,11,8] ],
		[ [3,0,9], [3,9,11], [11,9,10] ],
		[ [0,1,10], [0,10,8], [8,10,11] ],
		[ [3,1,10], [11,3,10] ],
		[ [1,2,11], [1,11,9], [9,11,8] ],
		[ [3,0,9], [3,9,11], [1,2,9], [2,11,9] ],
		[ [0,2,11], [8,0,11] ],
		[ [3,2,11] ],
		[ [2,3,8], [2,8,10], [10,8,9] ],
		[ [9,10,2], [0,9,2] ],
		[ [2,3,8], [2,8,10], [0,1,8], [1,10,8] ],
		[ [1,10,2] ],
		[ [1,3,8], [9,1,8] ],
		[ [0,9,1] ],
		[ [0,3,8] ],
		[]
	];
})();