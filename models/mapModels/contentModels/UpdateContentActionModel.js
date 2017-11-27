var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/updateContentAction');

	updateContent();		
}

function updateContent() {
	var title = request.body.title; 
	var content = request.body.content;
	var datetime = new Date();
	var content_idx = request.body.content_idx; 
	
	var tableName = 'contents';
	var columns = [ 'title', 'content', 'datetime' ]
	var conditions = [ 'content_idx' ];
	var values = [
		title,
		content,
		datetime,
		content_idx
	]

	var model = require('../../MySqlQueryModel.js');
	model.updateQuery(
		sqlConnection, 
		tableName, 
		columns,
		conditions,
		values,
		updateContentAction
	);
}

function updateContentAction(err, rows) {
	if(err) {
		console.log("updateContentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(rows){
		console.log("updateContentAction success");
		responsePacket = {command : "SUCCESSFUL"};
		response.end(JSON.stringify(responsePacket));		
	}
}