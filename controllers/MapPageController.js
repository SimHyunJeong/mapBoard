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

	var contentModelsPath = '../models/mapModels/contentModels';
	var commentModelsPath = '../models/mapModels/commentModels';
	var imageModelsPath = '../models/mapModels/imageModels';
	
	// ---------- content ---------------------------------------------------

	app.get('/loadContentsAction', function(request, response){
		var model = require(contentModelsPath + '/LoadContentsActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/selectContentAction', function(request, response){
		var model = require(contentModelsPath + '/SelectContentActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/insertContentAction', function(request, response){
		var model = require(contentModelsPath + '/InsertContentActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/deleteContentAction', function(request, response){
		var model = require(contentModelsPath + '/DeleteContentActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/updateContentAction', function(request, response){
		var model = require(contentModelsPath + '/UpdateContentActionModel.js');	
		model.action(request, response, sqlConnection);
	});

	// ---------- comment ---------------------------------------------------

	app.post('/loadCommentsAction', function(request, response){
		var model = require(commentModelsPath + '/LoadCommentsActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/insertCommentAction', function(request, response){
		var model = require(commentModelsPath + '/InsertCommentActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/deleteCommentAction', function(request, response){
		var model = require(commentModelsPath + '/DeleteCommentActionModel.js');	
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

