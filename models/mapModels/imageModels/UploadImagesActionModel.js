var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	console.log('/uploadImagesAction');

	insertImages();
}

function insertImages() {
	var files = request.files;
	var tableName = 'files';
	var columns = [ 'p_content_idx', 'file_name' ];
	var values = [];

	for(var i = 0; i < files.length; i++){
		values.push([request.body.p_content_idx, files[i].filename]);
	}

	var model = require('../../MySqlQueryModel.js');
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