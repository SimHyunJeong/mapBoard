var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/deleteCommentAction');

	deleteComment();		
}

function deleteComment() {
	var tableName = 'comments';
	var conditionQuery = 'comment_idx = ?';
	var values =  [ request.body.comment_idx ];
	
	var model = require('../../MySqlQueryModel.js');
	model.deleteQuery(
		sqlConnection, 
		tableName, 
		conditionQuery,
		values,
		deleteCommentAction
	);
}

function deleteCommentAction(err, result){
	if(err) {
		console.log("deleteCommentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(result.affectedRows){
		console.log("deleteCommentAction success");
		deleteChildComments();	
	}
}

function deleteChildComments() {
	var tableName = 'comments';
	var conditionQuery = 'p_comment_idx = ?';
	var values =  [ request.body.comment_idx ];
	
	var model = require('../../MySqlQueryModel.js');
	model.deleteQuery(
		sqlConnection, 
		tableName, 
		conditionQuery,
		values,
		deleteChildCommentsAction
	);
}

function deleteChildCommentsAction(err, result){
	if(err) {
		console.log("deleteChildCommentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	else{
		console.log("deleteChildCommentAction success");
		responsePacket = {command : "SUCCESSFUL"};
		response.end(JSON.stringify(responsePacket));	
	}
}