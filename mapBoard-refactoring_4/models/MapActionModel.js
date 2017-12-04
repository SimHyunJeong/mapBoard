var async = require("async");

var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/mapAction');				

	if(request.body.command != undefined) {
		switch(request.body.command){
			case "LOAD_CONTENTS" : {
				loadContents();	
				break;			
			}
			case "SELECT_CONTENT" : {
				selectContent();				
				break;
			}
			case "INSERT_CONTENT" : {
				createContent();
				break;
			}
			case "DELETE_CONTENT" : {
				deleteContent();
				break;
			}
			case "UPDATE_CONTENT" : {
				updateContent();
				break;
			}
			case "SELECT_COMMENT" : {
				selectComment();
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
}

function deleteComment() {
	var tableName = 'comments';
	var conditionQuery = 'comment_idx = ?';
	var values =  [ request.body.comment_idx ];
	
	var model = require('../models/MySqlQueryModel.js');
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
		deleteChildComment();	
	}
}

function deleteChildComment() {
	var tableName = 'comments';
	var conditionQuery = 'p_comment_idx = ?';
	var values =  [ request.body.comment_idx ];
	
	var model = require('../models/MySqlQueryModel.js');
	model.deleteQuery(
		sqlConnection, 
		tableName, 
		conditionQuery,
		values,
		deleteChildCommentAction
	);
}

function deleteChildCommentAction(err, result){
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

function createComment(){
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

	var model = require('../models/MySqlQueryModel.js');
	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		createCommentAction
	);
}

function createCommentAction(err, result){
	if(err) {
		console.log("createCommentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(result.affectedRows){
		console.log("createCommentAction success");
		responsePacket = {command : "SUCCESSFUL"};
		response.end(JSON.stringify(responsePacket));		
	}
}

function selectComment(){
	var columns = [ '*' ];
	var tableName = 'comments';
	var conditionQuery = 'p_content_idx = ? ';
	conditionQuery += 'order by group_no, datetime';
	var values = [ request.body.content_idx ]
	
	var model = require('../models/MySqlQueryModel.js');
	model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuery, 
		values,
		selectCommentAction
	);
}

function selectCommentAction(err, rows){
	if(err) {
		console.log("selectCommentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(rows){
		if(rows.length == 0){
			console.log("selectCommentAction success, comments zero");			
			request.session.LAST_COMMENT_G_NO = 0;
		}
		else{
			console.log("selectCommentAction success");
			var lastGroupNo = rows[rows.length-1].group_no;
			request.session.LAST_COMMENT_G_NO = lastGroupNo;			
		}
		response.end(JSON.stringify(rows));
	}
}

function loadContents() {
	var columns = [ 'content_idx', 'lat', 'lng' ];
	var tableName = 'contents';
	var conditions = null;
	var values = []
	
	var model = require('../models/MySqlQueryModel.js');
	model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditions, 
		values,
		loadContentsAction
	);
}

function loadContentsAction(err, rows){
	if(err) {
		console.log('loadContentAction error : ' + err);
		request.session.ERRORMESSAGE = "load contents error";
		response.redirect('/errorPage');
		return;
	}
	if(rows){
		console.log("loadContentsAction success");
		responsePacket = {
			command : "SUCCESSFUL",
			rows : rows
		};
		response.end(JSON.stringify(responsePacket));
	}
}

function selectContent() {
	var columns = [ '*' ];
	var tableName = 'contents';
	var conditionQuery = 'content_idx = ?';
	var values = [ request.body.content_idx ]
	
	var model = require('../models/MySqlQueryModel.js');
	model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuery, 
		values,
		selectContentAction
	);
}


function selectContentAction(err, rows){
	if(err) {
		console.log("selectContentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(rows){
		console.log("selectContentAction success");
		response.render('ContentPopups/ShowContentPopup.ejs', {
			row : rows[0]
		});	
	}
}

function createContent() {
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

	var model = require('../models/MySqlQueryModel.js');
	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		createContentAction
	);
}

function createContentAction(err, result){
	if(err) {
		console.log("createContentAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(result.affectedRows){
		console.log("createContentAction success");
		responsePacket = {
			command : "SUCCESSFUL",
			content_idx : result.insertId
		};
		response.end(JSON.stringify(responsePacket));		
	}
}

function deleteContent() {
	var tableName = 'contents';
	var conditionQuery = 'content_idx = ?';
	var values =  [ request.body.content_idx ];
	
	var model = require('../models/MySqlQueryModel.js');
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

	var model = require('../models/MySqlQueryModel.js');
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
	