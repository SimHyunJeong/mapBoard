var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	var id = request.body.id;
	var pw = request.body.pw;


	if(id == ''){
		console.log('undefined id');	

		request.session.ERRORMESSAGE = "undefined id";
		response.redirect('/errorPage');
	}
	else if(pw == ''){
		console.log('undefined pw');	
		
		request.session.ERRORMESSAGE = "undefined pw";
		response.redirect('/errorPage');	
	}
	else{
		console.log('/loginAction');			
		onLogin(id, pw);
	}
}

function onLogin(id, pw){
	var sqlQuary = 'select * ' + 
					'from `users` ' + 
					'where `id` = ? and `pw` = ?';

	sqlConnection.query(sqlQuary, [id, pw], (err, rows) => {
		loginAction(err, rows, id, pw);
	});
}

function loginAction(err, rows, id, pw){
	if(err) {
		request.session.ERRORMESSAGE = "login error";
		response.redirect('/errorPage');
		return;
	}	
	if(rows.length){
		console.log('id : ' + id + ' pw : ' + pw + ' success');
		var user = {id : id, pw : pw};		
		request.session.USER = user;
		response.redirect('/mapPage');
	}
	else{
		console.log('login failed check your id, pw');
		
		request.session.ERRORMESSAGE = "login failed check your id, pw";
		response.redirect('/errorPage');
	}
}