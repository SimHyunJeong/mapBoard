module.exports = function(app, sqlConnection)
{
    app.get('/errorPage', function(request, response){	  
		if(request.session.ERRORMESSAGE){
			response.render('ErrorPage.ejs', {
				message : request.session.ERRORMESSAGE
			});
			delete request.session.ERRORMESSAGE;
			console.log('/errorPage');
		}
		else{
			response.redirect('/');
		}
	});
}

