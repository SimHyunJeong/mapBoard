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
	
	console.log('/contentAction');

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
    }
}

function loadContents() {
	var columns = [ 'content_idx', 'lat', 'lng' ];
	var tableName = 'contents';
	var conditions = null;
	var values = []
	
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