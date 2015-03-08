var case_to_numpolys = require('./case_to_numpolys');
var edge_connect_list = require('./edge_connect_list');

var data = [];
for(var i = 0; i < 256; i++) {
	data[i] = [];
	
	for(var j = 0; j < case_to_numpolys[i]; j++) {
		data[i][j] = edge_connect_list[i * 5 + j].slice(0, 3);
	}
}

console.log(JSON.stringify(data))
