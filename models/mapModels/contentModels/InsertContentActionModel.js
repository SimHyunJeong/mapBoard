var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/insertContentAction');

	insertContent();		
}

function insertContent() {
	var tableName = 'contents';
	var columns = [
		'user_id', 
		'title', 
		'content', 
		'lat', 
		'lng', 
		'datetime' 
	];
	var values = [ 
		[request.body.user_id, 
		request.body.title, 
		request.body.content, 
		request.body.lat, 
		request.body.lng, 
		new Date()] 
	];

	var model = require('../../MySqlQueryModel.js');
	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		insertContentAction
	);
}

function insertContentAction(err, result){
	if(err) {
		console.log("insertContentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(result.affectedRows){
		console.log("insertContentAction success");
		responsePacket = {
			command : "SUCCESSFUL",
			content_idx : result.insertId
		};
		response.end(JSON.stringify(responsePacket));		
	}
}