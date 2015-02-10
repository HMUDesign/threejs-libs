function WorldVR(world) {
	var types = [WorldVROculus];
	for(var i = 0; i < types.length; i++) {
		if(!types[i].detect()) continue;
		
		types[i].call(world);
		
		for(var method in types[i].prototype) {
			if(world[method]) world['OLD_' + method] = world[method];
			world[method] = types[i].prototype[method];
		}
	}
}
