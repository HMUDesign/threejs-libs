var raw = require('fs').readFileSync('./case_to_numpolys.txt');

var data = raw.toString().split(',').map(function(item) {
	return +item.trim().split(' ')[0];
});

module.exports = data;
