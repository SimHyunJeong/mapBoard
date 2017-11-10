var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	console.log('/contentEditActionModel');				
	
	updateContent();
}

function updateContent() {
	var content_idx = request.body.content_idx;
	var title = request.body.title;
	var content = request.body.content;
	var lat = request.body.lat;
	var lng = request.body.lng;
	var datetime = new Date();

	var sqlQuary = "update contents " +
		"set title = ?, content = ?, lat = ?, lng = ?, datetime = ? " + 
		"where content_idx = ?";
	
	sqlConnection.query(sqlQuary, [title, content, lat, lng, datetime, content_idx], (err, rows) => {
		if(err) {
			request.session.ERRORMESSAGE = "update error";
			response.redirect('/errorPage');
			return;
		}
		
		response.redirect('/contentListPage' + '?idx=' + request.query.idx);
	});
}