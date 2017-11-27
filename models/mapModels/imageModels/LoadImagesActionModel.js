var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	console.log('/loadImagesAction');

	loadImages();	
}


function loadImages(id, pw){
	var columns = [ '*' ];
	var tableName = 'files';
	var conditionQuery = 'p_content_idx = ?';
	var values = [request.body.p_content_idx];
	
	var model = require('../../MySqlQueryModel.js');
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