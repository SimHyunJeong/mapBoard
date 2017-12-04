// --- 모듈 추가
var bodyParser = require('body-parser');
var express = require('express');
var mysql = require('mysql');
var session = require('express-session');
var jsonFile = require('jsonFile');
var multer = require('multer');
var socketIo = require('socket.io');
var socketEvent = require('./socket.js');

// --- setting 불러오기
var fileName = './setting.json';
var settingData = jsonFile.readFileSync(fileName);

// --- ip 설정
var hostName = settingData[0].hostName;
var serverPort = settingData[0].serverPort;

// --- mysql설정
var mySqlConnection = mysql.createConnection({
	host : hostName,
	port : settingData[0].sqlPort,
	database : settingData[0].database,
	user : settingData[0].user,
	password : settingData[0].password,
	multipleStatements : true
});

mySqlConnection.connect(err => {
	if(err) throw new Error(err);
});

// --- multer 설정
/*
// filename을 원하는 데로 설정
var storage = multer.diskStorage({
	destination : 'uploads/',
	filename : function(req, file, callback){
		callback(null, file.originalname);
	}
});
*/
var upload = multer({ 
	//storage : storage,
	dest : 'uploads/', 
	limits : { fileSize: 5 * 1024 * 1024 } 
});

// --- 모듈 설정
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json({limit : '10mb'}));

app.use(express.static('public'));

// --- session 설정
app.use(session({
	secret: '@#@$q1w2e3r4#@$#$',
	resave: false,
	saveUninitialized: true
}));   

// --- 캐시 제거로 인한 뒤로 가기 방지
app.use(function(request, response, next){
	response.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();
});

// --- 라우터 설정
var router = require('./Index')(app, mySqlConnection, upload);

// --- 서버 실행
var server = app.listen(serverPort, function(){
	console.log('Server running at http://' + hostName +':'+ serverPort);	
});

var io = new socketIo(server);
socketEvent(io);