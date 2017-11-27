var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/deleteContentAction');

	deleteContent();		
}

function deleteContent() {
	var tableName = 'contents';
	var conditionQuery = 'content_idx = ?';
	var values =  [ request.body.content_idx ];
	
	var model = require('../../MySqlQueryModel.js');
	model.deleteQuery(
		sqlConnection, 
		tableName, 
		conditionQuery,
		values,
		deleteContentAction
	);
}

function deleteContentAction(err, result){
	if(err) {
		console.log("deleteContentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(result.affectedRows){
		console.log("deleteContentAction success");
		responsePacket = {command : "SUCCESSFUL"};
		response.end(JSON.stringify(responsePacket));	
	}
}