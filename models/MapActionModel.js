var async = require("async");

var sqlConnection;
var request;
var response;

var jsonPacket = {
	command : "",
	content_idx : 0,
	user_id : "",
	title : "",
	content : "",
	lat : 0,
	lng : 0,
	datetime : ""
};

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/mapAction');				

	if(request.body.command != undefined) {
		switch(request.body.command){
			case "SELECT" : {
				selectContent();				
				break;
			}
			case "INSERT" : {
				createContent();
				break;
			}
			case "DELETE" : {
				deleteContent(request.body.content_idx);
				break;
			}
			case "UPDATE" : {
				updateContent();
				break;
			}
			case "COMMENT" : {
				/*
				async.waterfall( 
					[ 
						function(callback){ 
							updateCommentsOrder(callback);							
						}, 
						function(isSuccess, callback){ 
							if(isSuccess){ 
								createComment(callback); 
							} 
						}, 
						function(err){ 
							if(err) console.log(err); 
						} 
					] 
				); 
				*/
				selectComment();
				break;
			}
			case "CREATE_COMMENT" : {
				createComment();
				break;
			}
		}
	}
	else{
		loadContents();
	}
}

function createComment(){
	var sqlQuary = 'insert into comments' + 
	'(p_content_idx, p_comment_idx, user_id, comment, depth, datetime, group_no, group_ord) ' + 
	'values ?';

	var p_content_idx = request.body.p_content_idx;
	var p_comment_idx = request.body.p_comment_idx;
	var user_id = request.body.user_id;
	var comment = request.body.comment;
	var depth = request.body.depth;
	var datetime = new Date();
	var group_no = request.session.LAST_COMMENT_G_NO + 1;
	var group_ord = 0;

	console.log("group_no : " + request.body.group_no);
	console.log("depth : " + request.body.depth);
	
	if(request.body.group_no != null){
		group_no = request.body.group_no;
	}

	console.log("request.session.LAST_COMMENT_G_NO : " + request.session.LAST_COMMENT_G_NO);
	if(group_no == undefined){
		console.log("create comment error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}

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

	sqlConnection.query(sqlQuary, [values], (err, result) => {
		createCommentAction(err, result);
	});
}

function createCommentAction(err, result){
	if(err) {
		console.log("create error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(result.affectedRows){
		console.log("insert success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));		
	}
}
	

/*
function createComment(callback){
	var sqlQuary = 'insert into comments' + 
	'(p_content_idx, p_comment_idx, user_id, comment, depth, datetime, group_no, group_ord) ' + 
	'values ?';

	var p_content_idx = 177;
	var p_comment_idx = 10;
	var user_id = "test";
	var comment = "t_comment 3-1";
	var depth = 1;
	var datetime = null;
	var group_no = 3;
	var group_ord = 0 + 1;

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

	sqlConnection.query(sqlQuary, [values], (err, result) => {
		createCommentAction(err, result, callback);
	});
}

function createCommentAction(err, result, callback){
	if(err) {
		console.log("create error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(result.affectedRows){
		console.log("insert success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));		
	}
}
*/

function updateCommentsOrder(callback){
	var group_no = 3;
	var group_ord = 0;

	var sqlQuary = 'update comments set group_ord=group_ord+1 where group_no = ' + group_no + ' and group_ord > ' + group_ord;

	sqlConnection.query(sqlQuary, (err, result) => {
		updateCommentsOrderAction(err, result, callback);
	});
}

function updateCommentsOrderAction(err, result, callback){
	if(err) {
		console.log("update comments error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(result.affectedRows){
		console.log("update comments success");
		callback(null, true);
	}
}

function selectComment(){
	var sqlQuary = "select * from comments where p_content_idx = " + request.body.content_idx + " order by group_no, datetime";
	
	sqlConnection.query(sqlQuary, (err, rows) => {
		selectCommentAction(err, rows);
	});
}

function selectCommentAction(err, rows){
	if(err) {
		console.log("select comments error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(rows){
		if(rows.length == 0){
			request.session.LAST_COMMENT_G_NO = 0;
		}
		else{
			var lastGroupNo = rows[rows.length-1].group_no;
			request.session.LAST_COMMENT_G_NO = lastGroupNo;			
		}
		response.end(JSON.stringify(rows));
		//response.end(makeCommentsHtml(rows));
	}
}

function makeCommentsHtml(rows){
	var html = "<br><br><br>";

	for(var i = 0; i < rows.length; i++){
		for(var j = 0; j < rows[i].depth; j++){
			if(j == rows[i].depth-1){
				html += "└";
			}
			html += "&nbsp&nbsp&nbsp";
		}
		html += rows[i].user_id + " : ";
		html += rows[i].comment;
		html += "<br>";

		//console.log("comment_idx : " + rows[i].comment_idx);
	}

	return html;
}

function loadContents() {
	var sqlQuary = "select lat, lng from contents ";
	
	sqlConnection.query(sqlQuary, (err, rows) => {
		loadContentsAction(err, rows);
	});
}

function loadContentsAction(err, rows){
	if(err) {
		request.session.ERRORMESSAGE = "load contents error";
		response.redirect('/errorPage');
		return;
	}
	/*
	for(var i = 0; i < rows.length; i++){
		console.log("");
		console.log("idx : " + rows[i].content_idx);
		console.log("id : " + rows[i].user_id);
		console.log("title : " + rows[i].title);
		console.log("content : " + rows[i].content);
		console.log("lat : " + rows[i].lat);
		console.log("lng : " + rows[i].lng);
		console.log("datetime : " + rows[i].datetime);
	}*/

	request.session.CONTENTS = rows;
	response.redirect('/mapPage');	
}

function selectContent() {
	var sqlQuary = "select * " +
		"from contents " + 
		"where lat=" + request.body.lat + 
		"and lng=" + request.body.lng;
	
	sqlConnection.query(sqlQuary, (err, rows) => {
		selectContentAction(err, rows);
	});
}


function selectContentAction(err, rows){
	if(err) {
		console.log("select error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(rows){
		console.log("select success");
		//jsonPacket.command = "SUCCESSFUL";
		//response.end(JSON.stringify(jsonPacket));
		response.render('ContentPopups/ShowContentPopup.ejs', {
			row : rows[0]
		});	}
}

function createContent() {
	var sqlQuary = "insert into contents(user_id, title, content, lat, lng, datetime) values ?";

	var values = [ 
		[request.body.user_id, 
		request.body.title, 
		request.body.content, 
		request.body.lat, 
		request.body.lng, 
		new Date()] 
	];

	sqlConnection.query(sqlQuary, [values], (err, result) => {
		createContentAction(err, result);
	});
}

function createContentAction(err, result){
	if(err) {
		console.log("create error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(result.affectedRows){
		console.log("insert success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));		
	}
}

function deleteContent(idx) {
	var sqlQuary = "delete from contents where content_idx=" + '\'' + idx + '\'' + ";";
	
	sqlConnection.query(sqlQuary, (err, result) => {
		deleteContentAction(err, result);
	});
}

function deleteContentAction(err, result){
	if(err) {
		console.log("delete error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(result.affectedRows){
		console.log("delete success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));	
	}
}

function updateContent() {
	var sqlQuary = "update contents " +
		"set title = ?, content = ?, datetime = ? " + 
		"where content_idx = ?";
	
	console.log(request.body.content_idx);

	var title = request.body.title; 
	var content = request.body.content;
	var datetime = new Date();
	var content_idx = request.body.content_idx; 

	sqlConnection.query(sqlQuary, [title, content, datetime, content_idx], (err, rows) => {
		updateContentAction(err, rows);
	});
}

function updateContentAction(err, rows) {
	if(err) {
		console.log("update error");
		jsonPacket.command = "ERROR";
		response.end(JSON.stringify(jsonPacket));
		return;
	}
	if(rows){
		console.log("update success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));		
	}
}
	