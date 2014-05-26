HMU.Perlin = function(input) {
	var base = input.clone().floor();
	var relative = input.clone().sub(base);
	var eased = HMU.Perlin.ease(relative);
	var derivative = HMU.Perlin.dease(relative);
	
	var sum = 0;
	input.d = new THREE.Vector3();
	
	for(var i = 0; i < HMU.Perlin.corners.length; i++) {
		var corner = HMU.Perlin.corners[i];
		var vector = HMU.Perlin.gradient(base.clone().add(corner));
		var displacement = relative.clone().sub(corner);
		var value = displacement.dot(vector);
		
		function f() {
			return (corner.x ? eased.x : (1 - eased.x))
			     * (corner.y ? eased.y : (1 - eased.y))
			     * (corner.z ? eased.z : (1 - eased.z));
		}
		function dfx() {
			return (corner.x ? derivative.x : -derivative.x)
			     * (corner.y ? eased.y : (1 - eased.y))
			     * (corner.z ? eased.z : (1 - eased.z));
		}
		function dfy() {
			return (corner.y ? derivative.y : -derivative.y)
			     * (corner.x ? eased.x : (1 - eased.x))
			     * (corner.z ? eased.z : (1 - eased.z));
		}
		function dfz() {
			return (corner.z ? derivative.z : -derivative.z)
			     * (corner.x ? eased.x : (1 - eased.x))
			     * (corner.y ? eased.y : (1 - eased.y));
		}
		
		sum += value * f();
		
		input.d.x += vector.x * f() + value * dfx();
		input.d.y += vector.y * f() + value * dfy();
		input.d.z += vector.z * f() + value * dfz();
	}
	
	return sum;
}

HMU.Perlin.corners = [
	new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0),
	new THREE.Vector3(0,1,0), new THREE.Vector3(1,1,0),
	new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,1),
	new THREE.Vector3(0,1,1), new THREE.Vector3(1,1,1),
];

HMU.Perlin.gradient = function(input) {
	input = input.clone().round();
	var output = new THREE.Vector3();
	
	var i = HMU.Perlin.gradient.fp(input.z + HMU.Perlin.gradient.fp(input.y + HMU.Perlin.gradient.fp(input.x)));
	output.x = HMU.Perlin.gradient.fgx(i);
	output.y = HMU.Perlin.gradient.fgy(i);
	output.z = HMU.Perlin.gradient.fgz(i);
	
	return output.normalize();
}

;(function(seed) {
	var randx = seed;
	function rand(positive) {
		randx = (1103515245 * randx + 12345) % 4294967297;
		
		if(positive)
			return randx / 4294967297;
		else
			return randx / 2147483648 - 1;
	}
	
	HMU.Perlin.gradient.p = [];
	for(var i = 0; i < 256; i++)
		HMU.Perlin.gradient.p.push(i);
	for(var i = 0; i < HMU.Perlin.gradient.p.length; i++) {
		var j = Math.floor(rand(true) * HMU.Perlin.gradient.p.length);
		var t = HMU.Perlin.gradient.p[i];
		HMU.Perlin.gradient.p[i] = HMU.Perlin.gradient.p[j];
		HMU.Perlin.gradient.p[j] = t;
	}
	HMU.Perlin.gradient.fp = function(input) {
		input = Math.round(input);
		while(input <= 0) input += HMU.Perlin.gradient.p.length;
		input = input % HMU.Perlin.gradient.p.length;
		return HMU.Perlin.gradient.p[input];
	}
	
	HMU.Perlin.gradient.gx = [];
	HMU.Perlin.gradient.gy = [];
	HMU.Perlin.gradient.gz = [];
	for(var i = 0; i < HMU.Perlin.gradient.p.length; i++) {
		HMU.Perlin.gradient.gx.push(rand());
		HMU.Perlin.gradient.gy.push(rand());
		HMU.Perlin.gradient.gz.push(rand());
	}
	HMU.Perlin.gradient.fgx = function(input) {
		input = Math.round(input);
		while(input <= 0) input += HMU.Perlin.gradient.gx.length;
		input = input % HMU.Perlin.gradient.gx.length;
		return HMU.Perlin.gradient.gx[input];
	}
	HMU.Perlin.gradient.fgy = function(input) {
		input = Math.round(input);
		while(input <= 0) input += HMU.Perlin.gradient.gy.length;
		input = input % HMU.Perlin.gradient.gy.length;
		return HMU.Perlin.gradient.gy[input];
	}
	HMU.Perlin.gradient.fgz = function(input) {
		input = Math.round(input);
		while(input <= 0) input += HMU.Perlin.gradient.gy.length;
		input = input % HMU.Perlin.gradient.gy.length;
		return HMU.Perlin.gradient.gy[input];
	}
})(1);

HMU.Perlin.ease = function(input) {
	var output = input.clone();
	
	output.x = HMU.Perlin._ease(input.x);
	output.y = HMU.Perlin._ease(input.y);
	output.z = HMU.Perlin._ease(input.z);
	
	return output;
}
HMU.Perlin.dease = function(input) {
	var output = input.clone();
	
	output.x = HMU.Perlin._dease(input.x);
	output.y = HMU.Perlin._dease(input.y);
	output.z = HMU.Perlin._dease(input.z);
	
	return output;
}
HMU.Perlin._ease = function(t) {
//	return t;
//	return (3 - 2 * t) * t * t;
	return t * t * t * (t * (t * 6 - 15) + 10);
}
HMU.Perlin._dease = function(t) {
//	return 1;
//	return -6 * (t - 1) * t;
	return 30 * (t - 1) * (t - 1) * t * t;
}
