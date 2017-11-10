var async = require("async");

var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn, idx)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	console.log("/deleteContentAction");

	deleteContent(idx);
}

function deleteContent(idx) {
	var sqlQuary = "delete from contents where content_idx=" + '\'' + idx + '\'' + ";";
	
	sqlConnection.query(sqlQuary, (err, result) => {
		deleteContentAction(err, result);
	});
}

function deleteContentAction(err, result){
	if(err) {
		console.log(err);
		request.session.ERRORMESSAGE = "delete content error";
		response.redirect('/errorPage');
		return;
	}
	
	console.log("delete success");
	response.redirect('/contentListPage');	
}