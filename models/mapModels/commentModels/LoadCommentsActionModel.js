var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/loadCommentsAction');

	loadComments();		
}

function loadComments(){
	var columns = [ '*' ];
	var tableName = 'comments';
	var conditionQuery = 'p_content_idx = ? ';
	conditionQuery += 'order by group_no, comment_idx';
	var values = [ request.body.content_idx ]
	
	var model = require('../../MySqlQueryModel.js');
	model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuery, 
		values,
		loadCommentsAction
	);
}

function loadCommentsAction(err, rows){
	if(err) {
		console.log("loadCommentsAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(rows){
		if(rows.length == 0){
			console.log("loadCommentsAction success, comments zero");			
			request.session.LAST_COMMENT_G_NO = 0;
		}
		else{
			console.log("loadCommentsAction success");
			var lastGroupNo = rows[rows.length-1].group_no;
			request.session.LAST_COMMENT_G_NO = lastGroupNo;			
		}
		response.end(JSON.stringify(rows));
	}
}