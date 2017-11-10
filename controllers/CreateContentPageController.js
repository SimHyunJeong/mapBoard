module.exports = function(app, sqlConnection)
{
	app.get('/createContentPage', function(request, response){	  
		response.render('CreateContentPage.ejs', {
			user : request.session.USER
		});
		console.log('/createContentPage');
	});
	
	app.get('/closePopup', function(request, response){	  
		response.render('ClosePopup.ejs');
		console.log('/closePopup');
	});
	
	app.post('/createContentAction', function(request, response){
		var model = require('../models/CreateContentActionModel.js');	
		model.action(request, response, sqlConnection);
	});

}

