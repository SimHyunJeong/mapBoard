var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	console.log('/upload');		
	
	insertFile();
}

function insertFile() {
	var sqlQuary = "insert into files(p_content_idx, file_name) values ?";

	var values = [ 
		[request.body.p_content_idx, 
		request.file.filename] 
	];

	sqlConnection.query(sqlQuary, [values], (err, result) => {
		insertFileAction(err, result);
	});
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