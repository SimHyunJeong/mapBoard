module.exports = function(app, sqlConnection)
{
    var loginPageController = require('./controllers/LoginPageController')(app, sqlConnection);
    var signUpPageController = require('./controllers/SignUpPageController')(app, sqlConnection);
    var mapPageController = require('./controllers/MapPageController')(app, sqlConnection);
    var errorPageController = require('./controllers/ErrorPageController')(app, sqlConnection);
    var createContentPageController = require('./controllers/CreateContentPageController')(app, sqlConnection);
    var contentListPageController = require('./controllers/ContentListPageController')(app, sqlConnection);
    var contentPageController = require('./controllers/ContentPageController')(app, sqlConnection);
    var editContentPageController = require('./controllers/EditContentPageController')(app, sqlConnection);
}

