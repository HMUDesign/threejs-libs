var raw = require('fs').readFileSync('./edge_connect_list.txt');

var data = raw.toString().split(',').map(function(item) {
	return item.trim().split(/ +/).map(function(item) {
		return +item;
	});
});

module.exports = data;
