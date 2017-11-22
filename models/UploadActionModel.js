var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	console.log('/upload');	

	if(request.file == undefined){
		return;
	}
	insertFile();
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