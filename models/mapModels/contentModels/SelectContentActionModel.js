var sqlConnection;
var request;
var response;

var responsePacket;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	
	console.log('/selectContentAction');

	selectContent();		
}

function selectContent() {
	var columns = [ '*' ];
	var tableName = 'contents';
	var conditionQuery = 'content_idx = ?';
	var values = [ request.body.content_idx ]
	
	var model = require('../../MySqlQueryModel.js');
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

