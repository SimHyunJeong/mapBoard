var async = require("async");


var page;
var maxContentsLength;
var searchText;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	maxContentsLength = 5;
	page = request.query.page - 1;
	searchText = request.session.searchText;

	console.log('/contentListActionModel');				
	console.log(searchText);

	async.waterfall(
		[
			function(callback){
				loadContentsCount(callback);
			},
			function(count, callback){
				loadContents(count, callback);
			},
			function(err){
				if(err) console.log(err);
			}
		]
	);
}

function loadContentsCount(callback) {
	var countQuary;

	if(searchText == undefined){
		countQuary = 'select * from counts where what_count="contents_count"';
	}
	else{
		countQuary = 'select count(*) as count from contents where title like "%' + searchText + '%"';
	}

	sqlConnection.query(countQuary, (err, rows) => {
		// ----- 이부분을 함수로 추출하면 비동기로 코드가 동작해서 contentCount가 반환이 안됨
		if(err) {
			request.session.ERRORMESSAGE = "load contents count error";
			response.redirect('/errorPage');
			callback(null);
			return;
		}
		var contentsCount = rows[0].count;
		console.log("loadContentsCount : " + contentsCount);
		if(contentsCount == 0){
			request.session.ERRORMESSAGE = "there is no contents";
			response.redirect('/errorPage');
			return;
		}
	
		callback(null, contentsCount);
	});
}

function getStartLimitNumber(contentsCount){
	var pageRange = parseInt(contentsCount / maxContentsLength);
	if(contentsCount % maxContentsLength != 0){
		pageRange = pageRange + 1;
	}

	request.session.PAGERANGE = pageRange;
		
	if(request.query.page < 1){				
		request.query.page = 1;
		page = request.query.page - 1;
	}
	else if(request.query.page > pageRange){
		request.query.page = pageRange;
		page = request.query.page - 1;
	}

	return (maxContentsLength * page);
}

function loadContents(contentsCount, callback) {
	var startLimitNumber = getStartLimitNumber(contentsCount);
	console.log("startLimitNumber : " + startLimitNumber + ", page : " + page);
	
	var sText;
	if(searchText == undefined){
		sText ="";
	}
	else{
		sText = searchText;
	}

	var selectQuary = "select " + 
	"content_idx, user_id, title, lat, lng, datetime " +
	"from contents " + 
	"where title like " + '"%' + sText + '%" ' +
	"order by datetime desc " + 
	"limit " + startLimitNumber + "," + maxContentsLength;

	sqlConnection.query(selectQuary, (err, rows) => {
		loadContentsAction(err, rows, callback);
	});
}

function loadContentsAction(err, rows, callback) {
	if(err) {
		request.session.ERRORMESSAGE = "load contents error";
		response.redirect('/errorPage');
		return;
	}
	console.log("rows.length : " + rows.length);
	/*
	for(var i = 0; i < rows.length; i++){
		console.log("");
		console.log("idx : " + rows[i].content_idx);
		console.log("id : " + rows[i].user_id);
		console.log("title : " + rows[i].title);
		console.log("content : " + rows[i].content);
		console.log("lat : " + rows[i].lat);
		console.log("lng : " + rows[i].lng);
		console.log("datetime : " + rows[i].datetime);
	}
	*/

	request.session.CONTENTS = rows;

	response.redirect('/contentListPage' + '?page=' + request.query.page);
	callback(null);			
}
