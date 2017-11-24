module.exports = function(app, sqlConnection, upload)
{
  	app.get('/mapPage', function(request, response){
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		if(!request.session.USER){
			response.redirect('/');			
		}
		else{			
			response.render('MapPage.ejs', {
				user : request.session.USER,
			});
			console.log('/mapPage');
		}
	});
	app.post('/mapAction', function(request, response){
		var model = require('../models/MapActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	
	app.get('/createContentPopup', function(request, response){
		response.render('ContentPopups/CreateContentPopup.ejs');
		console.log("/createContentPopup");
	});

	app.get('/editContentPopup', function(request, response){
		response.render('ContentPopups/EditContentPopup.ejs');
		console.log("/editContentPopup");
	});

	app.post('/uploadImages', upload.array('uploadFiles'), function(request, response){
		if(request.files == undefined){
			return;
		}
		var model = require('../models/ImgActionModel.js');	
		model.action(request, response, sqlConnection);
	});

	app.post('/loadImages', function(request, response){
		var model = require('../models/ImgActionModel.js');	
		model.action(request, response, sqlConnection);
	});

	app.get('/showImage', function(request, response){
		var model = require('../models/ShowImgActionModel.js');	
		model.action(request, response, request.query.file_name);
	});

	app.get('/downloadImage', function(request, response){
		response.download('./uploads/' + request.query.file_name);
	});
}

