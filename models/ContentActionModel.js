var sqlConnection; 
var request; 
var response; 
var page; 
var maxContentsLength; 

exports.action = function(req, res, sqlConn) 
{ 
	sqlConnection = sqlConn; 
 	request = req; 
 	response = res; 
 
 	console.log('/contentActionModel');				 

 	loadContent(); 
} 
 
function loadContent() { 
	var sqlQuary = 'select * ' + 
				'from contents ' +  
				'where lat=' + request.body.lat + 'and lng=' + request.body.lng; 
				
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
	if(rows) {
		response.render('ContentPage.ejs', {
			row : rows[0]
		});
	}
} 
