var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/loadContentsAction');

	loadContents();		
}

function loadContents() {
	var columns = [ 'content_idx', 'lat', 'lng' ];
	var tableName = 'contents';
	var conditions = null;
	var values = []
	
	var model = require('../../MySqlQueryModel.js');
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