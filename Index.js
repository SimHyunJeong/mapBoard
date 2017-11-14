module.exports = function(app, sqlConnection)
{
    var loginPageController = require('./controllers/LoginPageController')(app, sqlConnection);
    var signUpPageController = require('./controllers/SignUpPageController')(app, sqlConnection);
    var mapPageController = require('./controllers/MapPageController')(app, sqlConnection);
    var errorPageController = require('./controllers/ErrorPageController')(app, sqlConnection);
}

