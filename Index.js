module.exports = function(app, sqlConnection, upload)
{
    var loginPageController = require('./controllers/LoginPageController')(app, sqlConnection);
    var signUpPageController = require('./controllers/SignUpPageController')(app, sqlConnection);
    var mapPageController = require('./controllers/MapPageController')(app, sqlConnection, upload);
    var errorPageController = require('./controllers/ErrorPageController')(app, sqlConnection);
}

