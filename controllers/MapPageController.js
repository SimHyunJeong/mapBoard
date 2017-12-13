module.exports = function(app, sqlConnection, upload)
{
  	app.get('/mapPage', function(request, response){
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					
		var visitor = {id : 'visitor', pw : '123'};
		response.render('MapPage.ejs', {
			user : visitor
		});
		console.log('/mapPage');
	});
	app.get('/createContentPopup', function(request, response){
		response.render('ContentPopups/CreateContentPopup.ejs');
		console.log("/createContentPopup");
	});
	app.get('/editContentPopup', function(request, response){
		response.render('ContentPopups/EditContentPopup.ejs');
		console.log("/editContentPopup");
	});

	var mapModelsPath = '../models/mapModels';
	
	// ---------- content ---------------------------------------------------

	app.post('/contentAction', function(request, response){
		var model = require(mapModelsPath + '/ContentActionModel.js');
		model.action(request, response, sqlConnection);
	});

	// ---------- comment ---------------------------------------------------

	app.post('/commentAction', function(request, response){
		var model = require(mapModelsPath + '/CommentActionModel.js');
		model.action(request, response, sqlConnection);
	});

	// ---------- image ---------------------------------------------------
	
	app.post('/imageAction', upload.array('uploadFiles'), function(request, response){
		if(request.files == undefined){
			return;
		}
		var model = require(mapModelsPath + '/ImageActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.post('/loadImagesAction', function(request, response){
		var model = require(mapModelsPath + '/ImageActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	app.get('/showImageAction', function(request, response){
		var model = require(mapModelsPath + '/ShowImageActionModel.js');	
		model.action(request, response, request.query.file_name);
	});
	app.get('/downloadImage', function(request, response){
		response.download('./uploads/' + request.query.file_name, request.query.original_name);
	});
}

