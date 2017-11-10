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
			case "SELECT": {
				selectContent();				
				break;
			}
			case "INSERT": {
				createContent();
				break;
			}
			case "DELETE": {
				deleteContent(request.body.content_idx);
				break;
			}
			case "UPDATE": {
				updateContent();
				break;
			}
		}
	}
	else{
		loadContents();
	}
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
		jsonPacket.content_idx = rows[0].content_idx;
		jsonPacket.user_id = rows[0].user_id;
		jsonPacket.title = rows[0].title;
		jsonPacket.content = rows[0].content;
		jsonPacket.lat = rows[0].lat;
		jsonPacket.lng = rows[0].lng;
		jsonPacket.datetime = rows[0].datetime;

		console.log("select success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));
	}
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
	