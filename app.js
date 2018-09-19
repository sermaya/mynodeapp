//import modules
var express        = require("express");
var app             = express();
var path            = require("path");
var mongoose       = require("mongoose");
var session         = require('express-session');
var flash          = require('connect-flash');
var bodyParser     = require("body-parser");
var methodOverride   = require("method-override");

//connect database
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser : true});
mongoose.set('useCreateIndex', true);
var db = mongoose.connection;
db.once("open", function(){
    console.log("DB Connected");
});

db.on("error", function(err){
    console.log("DB ERROR : ". err)
});

//view engine setting
app.set("view engine", "ejs");

//set middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/views")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extends:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:'MySecret'}));

//passport
var passport = require('./config/passport')
app.use(passport.initialize());
app.use(passport.session());

//set route
app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));

//start server
app.listen(3000, function(){
    console.log("Server On!")
})
