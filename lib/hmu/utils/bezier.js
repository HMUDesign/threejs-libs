var HMU = HMU || {};

HMU.Bezier = (function() {
	function bezier(p, t) {
		if(p.length === 0) throw new Error('Bezier: must provide points');
		
		if(p.length === 1) {
			return p[0];
		}
		
		return (1 - t) * bezier(p.slice(0, p.length - 1), t) + (t) * bezier(p.slice(1, p.length), t);
	}
	
	var Bezier = function(p) {
		this.p = p;
	}
	
	Bezier.prototype.eval = function(t) {
		return bezier(this.p, t);
	}
	
	return Bezier;
})();
