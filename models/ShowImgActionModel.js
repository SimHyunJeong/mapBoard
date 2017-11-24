var request;
var response;

var fs = require('fs');

exports.action = function(req, res, file_name)
{
	request = req;
	response = res;

	console.log('/showImage');	

	fs.readFile('./uploads/' + file_name, function(err, data){
		//response.writeHead(200, {'Content-Type' : 'text/html'});
		response.end(data);
	});

}