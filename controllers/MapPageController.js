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
	app.get('/createContentPopup', function(request, response){
		response.render('ContentPopups/CreateContentPopup.ejs');
		console.log("/createContentPopup");
	});
	app.get('/editContentPopup', function(request, response){
		response.render('ContentPopups/EditContentPopup.ejs');
		console.log("/editContentPopup");
	});

	var commentModelsPath = '../models/mapModels/commentModels';
	var imageModelsPath = '../models/mapModels/imageModels';
	
	// ---------- content ---------------------------------------------------

	app.post('/contentAction', function(request, response){
		var model = require('../models/mapModels/ContentActionModel.js');
		model.action(request, response, sqlConnection);
	});

	// ---------- comment ---------------------------------------------------

	app.post('/commentAction', function(request, response){
		var model = require('../models/mapModels/CommentActionModel.js');
		model.action(request, response, sqlConnection);
	});

	// ---------- image ---------------------------------------------------

	app.post('/loadImagesAction', function(request, response){
		var model = require(imageModelsPath + '/LoadImagesActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/uploadImagesAction', upload.array('uploadFiles'), function(request, response){
		if(request.files == undefined){
			return;
		}
		var model = require(imageModelsPath + '/UploadImagesActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.get('/showImageAction', function(request, response){
		var model = require(imageModelsPath + '/ShowImageActionModel.js');	
		model.action(request, response, request.query.file_name);
	});
	app.get('/downloadImage', function(request, response){
		response.download('./uploads/' + request.query.file_name, request.query.original_name);
	});
}

