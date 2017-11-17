module.exports = function(app, sqlConnection)
{
  	app.get('/mapPage', function(request, response){
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		if(!request.session.USER){
			response.redirect('/');			
		}
		else if(request.session.CONTENTS){
			var rows = request.session.CONTENTS;
			delete request.session.CONTENTS;
			
			response.render('MapPage.ejs', {
				user : request.session.USER,
				contents : rows
			});
			console.log('/mapPage');
		}
		else{
			response.redirect('/mapAction');
		}
	});

    app.get('/mapAction', function(request, response){
		if(request.session.USER){
			var model = require('../models/MapActionModel.js');
			model.action(request, response, sqlConnection);	
		}
		else{
			response.render('ErrorPage.ejs', {
				message : "login first please"
			});		
		}
	});

	app.post('/mapAction', function(request, response){
		var model = require('../models/MapActionModel.js');	
		model.action(request, response, sqlConnection);
	});

	
	app.get('/createContentPage', function(request, response){
		response.render('ContentPopups/CreateContentPopup.ejs');
		console.log("/createContentPage");
	});

	app.get('/editContentPage', function(request, response){
		response.render('ContentPopups/EditContentPopup.ejs');
		console.log("/editContentPage");
	});

	app.post('/showContentPage', function(request, response){
		var model = require('../models/ContentActionModel.js');	
		model.action(request, response, sqlConnection);
		console.log('/showContentPage');
	});
}

