var MarchingCubes = (function() {
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
	
	MarchingCubes.load = function() {
		if(!loader) {
			loader = new Promise(function(resolve, reject) {
				var loader = new THREE.XHRLoader();
				loader.load('triangles.json', function(triangles) {
					MarchingCubes.triangles = JSON.parse(triangles);
					resolve();
				});
			});
		}
		
		return loader;
	}
	
	MarchingCubes.prototype = Object.create(THREE.Geometry.prototype);
	
	return MarchingCubes;
})();
