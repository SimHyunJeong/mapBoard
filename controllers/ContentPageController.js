module.exports = function(app, sqlConnection)
{
    app.get('/contentPage', function(request, response){
        response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

		if(!request.session.USER){
			response.redirect('/');			
		}
		else if(request.session.CONTENT){
			var row = request.session.CONTENT;
			delete request.session.CONTENT;
			
			response.render('ContentPage.ejs', {
				user : request.session.USER,
				content : row
			});
			console.log('/contentPage');
		}
		else{
			response.redirect('/contentAction' + '?idx=' + request.query.idx);
		}
	});

	app.get('/contentAction', function(request, response){
		if(request.session.USER){
			var model = require('../models/ContentActionModel.js');
			model.action(request, response, sqlConnection);
		}
		else{
			response.render('ErrorPage.ejs', {
				message : "login first please"
			});		
		}
	});
}

