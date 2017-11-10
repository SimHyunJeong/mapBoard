module.exports = function(app, sqlConnection)
{
	app.get('/signUpPage', function(request, response){
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		
		if(request.session.USER){
			response.redirect('/mapAction');
		}
		else{
			response.render('SignUpPage.ejs');
			console.log('/signUpPage');
		}
	});
	
	app.post('/signUpAction', function(request, response){	
		var model = require('../models/SignUpActionModel.js');	
		model.action(request, response, sqlConnection);
	});
}

