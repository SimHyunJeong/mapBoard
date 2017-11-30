var sqlConnection;
var request;
var response;

var responsePacket;

var model;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	model = require('../MySqlQueryModel.js');
	
	console.log('/commentAction');

    switch(request.body.command){
        case "LOAD_COMMENTS" : {
			loadComments();
			break;
		}
		case "INSERT_COMMENT" : {
			createComment();
			break;
		}
		case "DELETE_COMMENT" : {
			deleteComment();
			break;
		}
    }
}

function loadComments(){
	var columns = [ '*' ];
	var tableName = 'comments';
	var conditionQuery = 'p_content_idx = ? ';
	conditionQuery += 'order by group_no, comment_idx';
	var values = [ request.body.content_idx ]
	
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

function deleteComment() {
	var tableName = 'comments';
	var conditionQuery = 'comment_idx = ?';
	var values =  [ request.body.comment_idx ];
	
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