var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn) 
{ 
	sqlConnection = sqlConn; 
 	request = req; 
 	response = res; 
 
 
 	console.log('/contentActionModel');				 
 
 
 	loadContent(); 
} 
 
 
function loadContent() { 
	var sqlQuary = "select * " + 
		"from contents " +  
		"where content_idx=" + request.query.idx; 
 	 
 	sqlConnection.query(sqlQuary, (err, rows) => { 
 		loadContentAction(err, rows); 
 	}); 
} 
 
 
function loadContentAction(err, rows){ 
 	if(err) { 
 		request.session.ERRORMESSAGE = "load content error"; 
 		response.redirect('/errorPage'); 
 		return; 
 	} 
 	request.session.CONTENT = rows[0]; 
 	 
 	response.redirect('/contentPage' + '?idx=' + request.query.idx);		 
} 
