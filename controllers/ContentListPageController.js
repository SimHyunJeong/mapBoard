module.exports = function(app, sqlConnection)
{
    app.get('/contentListPage', function(request, response){
        response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

		if(!request.session.USER){
			response.redirect('/');			
		}
		else if(request.session.CONTENTS){
            if(request.query.page == undefined){
				request.query.page = '1';
				delete request.session.searchText;
            }
			var rows = request.session.CONTENTS;
			delete request.session.CONTENTS;
			
			response.render('ContentListPage.ejs', {
				user : request.session.USER,
				contents : rows,
				page : request.query.page,
				pageRange : request.session.PAGERANGE
			});
			console.log('/contentListPage');
		}
		else{
            if(request.query.page == undefined){
				request.query.page = '1';
				delete request.session.searchText;				
            }
			response.redirect('/contentListAction' + '?page=' + request.query.page);
		}
	});
	
	app.get('/contentListAction', function(request, response){
		if(request.session.USER){
			if(request.query.searchText != undefined){
				request.session.searchText = request.query.searchText;				
			}
			
			var model = require('../models/ContentListActionModel.js');
			model.action(request, response, sqlConnection);
		}
		else{
			response.render('ErrorPage.ejs', {
				message : "login first please"
			});		
		}
	});
}

