var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/insertCommentAction');

	insertComment();		
}

function insertComment(){
	var p_content_idx = request.body.p_content_idx;
	var p_comment_idx = request.body.p_comment_idx;
	var user_id = request.body.user_id;
	var comment = request.body.comment;
	var depth = request.body.depth;
	var datetime = new Date();
	var group_no = request.body.group_no;
	var group_ord = 0;
	
	if(request.body.group_no == ''){
		group_no = request.session.LAST_COMMENT_G_NO + 1;		
	}
	if(request.body.p_comment_idx == ''){
		p_comment_idx = null;
	}

	var tableName = 'comments';
	var columns = [ 
		'p_content_idx', 
		'p_comment_idx', 
		'user_id', 
		'comment', 
		'depth', 
		'datetime', 
		'group_no', 
		'group_ord' 
	];
	var values = [ 
		[p_content_idx, 
		p_comment_idx, 
		user_id, 
		comment, 
		depth, 
		datetime, 
		group_no, 
		group_ord] 
	];

	var model = require('../../MySqlQueryModel.js');
	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		insertCommentAction
	);
}

function insertCommentAction(err, result){
	if(err) {
		console.log("insertCommentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(result.affectedRows){
		console.log("insertCommentAction success");
		responsePacket = {command : "SUCCESSFUL"};
		response.end(JSON.stringify(responsePacket));		
	}
}