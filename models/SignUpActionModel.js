var async = require("async");

var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;

	// --- body parser로 post 데이터 받기
	var id = request.body.id;
	var pw = request.body.pw;

	console.log('/signUpAction');		
	
	// --- 오류 검사
	if(id == ''){
		console.log('undefined id');					
		
		request.session.ERRORMESSAGE = "undefined id";
		response.redirect('/errorPage');
	}
	else if(pw == ''){
		console.log('undefined id');					
		
		request.session.ERRORMESSAGE = "undefined pw";
		response.redirect('/errorPage');
	}
	else{
		// ----회원 가입 진행
		async.waterfall(
			[
				function(callback){
					checkUserExist(id, pw, callback);
				},
				function(isExist, callback){
					if(!isExist){
						signUp(id, pw, callback);					
					}
					else{
						callback(null);
					}
				},
				function(err){
					if(err) console.log(err);
				}
			]
		);
	}
}


function checkUserExist(id, pw, callback){
	var columns = '*';
	var tableName = 'users';
	var conditionQuery = 'id = ?';
	var values = [id]
	
	var model = require('../models/MySqlQueryModel.js');
	model.selectQuery(
		sqlConnection, 
		columns, 
		tableName, 
		conditionQuery, 
		values,
		userCheckAction, 
		callback
	);
}

function userCheckAction(err, rows, callback){
	if(err) {
		console.log('userCheckAction error : ' + err);
		request.session.ERRORMESSAGE = "check user exist error";
		response.redirect('/errorPage');
		return;
	}	
	if(rows.length){
		console.log('id already exist : ' + rows[0].id);
		
		request.session.ERRORMESSAGE = "id already exist";
		response.redirect('/errorPage');
		callback(null, true);			
	}
	else{
		callback(null, false);
	}
}

function signUp(id, pw, callback){	
	var tableName = 'users';
	var columns = ['id', 'pw'];
	var values = [ [id, pw] ];

	var model = require('../models/MySqlQueryModel.js');
	model.insertQuery(
		sqlConnection, 
		tableName, 
		columns, 
		values, 
		signUpAction, 
		callback
	);
}

function signUpAction(err, result, values, callback){
	if(err) {
		console.log("signUpAction error : " + err);
		request.session.ERRORMESSAGE = "signUp error";
		response.redirect('/errorPage');
		return;
	}
	if(result.affectedRows){
		var user = { id : values[0][0], pw : values[0][1] };
		request.session.USER = user;
		console.log('sign up success');		
		response.redirect('/mapPage');
		callback(null);	
	}
}
