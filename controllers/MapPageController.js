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

	app.post('/upload', upload.single('filename'), function(request, response){
		var model = require('../models/UploadActionModel.js');	
		model.action(request, response, sqlConnection);
		//res.download('uploads/' + req.file.filename);
	});

}

