var sqlConnection;
var request;
var response;

exports.action = function(req, res, sqlConn)
{
	sqlConnection = sqlConn;
	request = req;
	response = res;
	console.log("/createContentAction");

	createContent();
}

function createContent() {
	var sqlQuary = "insert into contents(user_id, title, content, lat, lng, datetime) values ?";

	jsonPacket.user_id = request.body.user_id;
	jsonPacket.title = request.body.title;
	jsonPacket.content = request.body.content;
	jsonPacket.lat = request.body.lat;
	jsonPacket.lng = request.body.lng;
	jsonPacket.datetime = new Date();
	
	console.log("user_id : " + jsonPacket.user_id);
	console.log("title : " + jsonPacket.title);
	console.log("content : " + jsonPacket.content);
	console.log("lat : " + jsonPacket.lat);
	console.log("lng : " + jsonPacket.lng);
	console.log("datetime : " + jsonPacket.datetime);
	
	var values = [ 
		[jsonPacket.user_id, 
		jsonPacket.title, 
		jsonPacket.content, 
		jsonPacket.lat, 
		jsonPacket.lng, 
		jsonPacket.datetime] 
	];

	sqlConnection.query(sqlQuary, [values], (err, result) => {
		createContentAction(err, result);
	});
}

function createContentAction(err, result){
	if(err) {
		request.session.ERRORMESSAGE = "create content error";
		response.redirect('/errorPage');
		return;
	}
	if(result.affectedRows){
		console.log("insert success");
		jsonPacket.command = "SUCCESSFUL";
		response.end(JSON.stringify(jsonPacket));		
	}
}
