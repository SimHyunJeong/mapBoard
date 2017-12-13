module.exports = function(app, sqlConnection)
{
	app.get('/',function(request,response){
		response.redirect('/mapPage');			
	});
	app.get('/loginPage',function(request,response){
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

		if(request.session.USER){
			response.redirect('/mapPage');
		}
		else{
			response.render('LoginPage.ejs');
			console.log('/loginPage');
		}	
	});
	app.get('/logoutAction', function(request, response){
		console.log("logoutAction");		
		delete request.session.USER;
		response.redirect('/');		
	});

	app.post('/loginAction', function(request, response){
		console.log("loginAction");
		var model = require('../models/LoginActionModel.js');	
		model.action(request, response, sqlConnection);
	});
	
}

