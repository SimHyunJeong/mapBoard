module.exports = function(app, sqlConnection)
{
	app.post('/editContentPage', function(request, response){
        response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		
		if(!request.session.USER){
			response.redirect('/');	
		}
		else{
			var row = JSON.parse(request.body.json);
			
			response.render('EditContentPage.ejs', {
				user : request.session.USER,
				content : row
			});
			console.log('/editContentPage');
		}
	});

	app.post('/editContentAction', function(request, response){
		if(request.session.USER){
			var model = require('../models/EditContentActionModel.js');
			model.action(request, response, sqlConnection);
		}
		else{
			response.render('ErrorPage.ejs', {
				message : "login first please"
			});		
		}
	});

	app.get('/deleteContentAction', function(request, response){
		if(request.session.USER){
			var model = require('../models/DeleteContentActionModel.js');
			model.action(request, response, sqlConnection, request.query.idx);
		}
		else{
			response.render('ErrorPage.ejs', {
				message : "login first please"
			});		
		}
	});
}

