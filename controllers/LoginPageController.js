module.exports = function(app, sqlConnection)
{
	app.get('/',function(request,response){
		response.redirect('/mapPage');			
	});
	app.get('/adminPage',function(request,response){
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

		if(request.session.USER){
			response.redirect('/mapPage');
		}
		else{
			response.render('LoginPage.ejs');
			console.log('/adminPage');
		}	
	});

	app.post('/loginAction', function(request, response){
		console.log("loginAction");
		var model = require('../models/LoginActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	
}

