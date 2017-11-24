var request;
var response;

var fs = require('fs');

exports.action = function(req, res, file_name)
{
	request = req;
	response = res;

	console.log('/showImage' + '?file_name=' + file_name);	

	var file = fs.readFileSync('./uploads/' + file_name);
	response.end(file);

}