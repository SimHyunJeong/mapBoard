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
		login(id, pw);
	}
}

function login(id, pw){
	var columns = [ '*' ];
	var tableName = 'users';
	var conditionQuery = 'id = ? and pw = ?';
	var values = [id, pw];
	
	var model = require('../models/MySqlQueryModel.js');
	var rows = model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuery, 
		values,
		loginAction
	);
}

function loginAction(err, rows){
	if(err) {
		console.log("loginAction error : " + err);
		request.session.ERRORMESSAGE = "login error";
		response.redirect('/errorPage');
		return;
	}	
	if(rows.length){
		var id = rows[0].id;
		var pw = rows[0].pw;
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