var express=require("express");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);


var fs=require("fs");
var path = require('path');
var extend = require('extend');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


///////////////////////////////////////////////////////////


var confFile = path.resolve(process.cwd(),process.argv[2] || './src/config/conf.json');
console.log("Configuration Path : "+confFile);


var LOGGER=require("log4js").getLogger("main");
LOGGER.info("Début du log");
global.conf = JSON.parse(fs.readFileSync(confFile));

var model = require('./model');
var Conf = model.conf;

Conf.get("theme",function(err,result){
	if (result === null){
		global.conf.view.theme = "default";
	} else {
		global.conf.view.theme = result;
	}
})

var User = model.users;
var acl = require('./middle/acl');

var app = express();

if (process.env.NODE_ENV != 'production'){
	var logRouter = express.Router();
	logRouter.all('*',function(req,res,next){
		LOGGER.trace(req.method+" "+req.url);
		next();
	});
	app.use(logRouter);
}

app.use(cookieParser());

var store = new MongoDBStore(
      { 
        uri: conf.mongodb,
        collection: 'sessions'
      }
);
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(
	new GoogleStrategy({
		clientID: conf.google.client_id,
		clientSecret: conf.google.client_secret,
		callbackURL: conf.view.baseUrl+"/login/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		delete profile._raw;
		delete profile._json;
		User.findOrCreate(profile, function (err, user) {
			User.setToken(user.id,accessToken, function(err,update){
   				return done(err, extend(user,{token:accessToken}));
			});
		});
	}
));
passport.serializeUser(function(user, done) {
	done(null, user.token);
});
passport.deserializeUser(function(token, done) {
	User.findByToken(token, done);
});

app.set('views',path.resolve(__dirname,'../resources/view'));
app.set('view engine','jade');
app.locals.pretty = true;

app.use('/public', express.static(path.resolve(__dirname,'../resources/public')));

app.use('/login',require('./routes/login'));

app.use(acl.needUser());
app.use(acl.needValidUser());
app.use(acl.needRole('view'));
app.use(require("./middle/isAdmin"));
app.use(require('./routes/public'));
app.use('/files',require('./routes/files'));

app.use('/admin',acl.needRole('admin'));
app.use('/admin',require('./routes/admin'));

app.listen(conf.port);
LOGGER.info("Listen "+conf.port);