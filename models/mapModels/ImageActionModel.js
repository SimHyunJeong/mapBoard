var sqlConnection;
var request;
var response;
var model;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	model = require('../MySqlQueryModel.js');

	console.log('/imageAction');

	switch(request.body.command){
        case "LOAD_IMAGES" : {
            loadImages();	
            break;			
		}
		case "UPLOAD_IMAGES" : {
			insertImages();
            break;			
        }
    }
}

function loadImages(id, pw){
	var columns = [ '*' ];
	var tableName = 'files';
	var conditionQuery = 'p_content_idx = ?';
	var values = [request.body.p_content_idx];
	
	var rows = model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuery, 
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

function insertImages() {
	var files = request.files;
	var tableName = 'files';
	var columns = [ 'p_content_idx', 'file_name', 'original_name' ];
	var values = [];

	for(var i = 0; i < files.length; i++){
		console.log(files[i]);
		values.push([
			request.body.p_content_idx, 
			files[i].filename, 
			files[i].originalname
		]);
	}

	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		insertImagesAction
	);
}

function insertImagesAction(err, result){
	if(err) {
		console.log("insert image error : " + err);
		return;
	}
	if(result.affectedRows){
		console.log("insert image success");
		return;
	}
}