var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	console.log('/uploadImages');

	if(request.body.command != undefined) {
		switch(request.body.command){
			case "LOAD_IMAGES" : {
				loadImages();	
				break;			
			}
		}
	}
	else{
		insertFile();
	}
}


function loadImages(id, pw){
	var columns = [ '*' ];
	var tableName = 'files';
	var conditionQuary = 'p_content_idx = ?';
	var values = [request.body.p_content_idx];
	
	var model = require('../models/MySqlQuaryModel.js');
	var rows = model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuary, 
		values,
		loadImagesAction
	);
}

function loadImagesAction(err, rows){
	if(err) {
		console.log("loadImagesAction error : " + err);
		responsePacket = {command : "ERROR"};
		response.end(JSON.stringify(responsePacket));
		return;
	}
	if(rows){
		if(rows.length == 0){
			console.log("loadImagesAction success, files zero");			
		}
		else{
			console.log("loadImagesAction success");
		}
		response.end(JSON.stringify(rows));
	}
}

function insertFile() {
	var tableName = 'files';
	var columns = [ 'p_content_idx', 'file_name' ];
	var values = [ 
		[request.body.p_content_idx, 
		request.file.filename] 
	];

	var model = require('../models/MySqlQuaryModel.js');
	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		insertFileAction
	);
}

function insertFileAction(err, result){
	if(err) {
		console.log("insert file error : " + err);
		return;
	}
	if(result.affectedRows){
		console.log("insert file success");
		return;
	}
}