/**
 * Created by junelee on 2018-08-30.
 */
//mongodb://<dbuser>:<dbpassword>@ds239412.mlab.com:39412/juni_node_db
//mongodb 접속 : mongodb://my_node_test:l10045504j@ds239412.mlab.com:39412/juni_node_db

var express = require("express");
var path = require("path");
var app = express();
var mongoose = require("mongoose");
var process = require("process");

console.log(process.env.MONGO_DB);

//몽고DB 설정 - process.env.MONGO_DB : 윈도우 환경변수에 설정
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser : true});
var db = mongoose.connection;
db.on("error", function(err){
    console.log("DB ERROR : ". err)
});

db.once("open", function(){
    console.log("DB Connected");
});

//object를 인자로 받아 그 object를 스키마로 만든다.
var dataSchema = mongoose.Schema({
    name : String,
    count : Number
});

//모델을 담는 변수는 첫글자가 대문자이다.
var Data = mongoose.model('data', dataSchema);  //mongodb의 document객체를 만든다.

Data.findOne({name:"mydata"}, function(err, data){
    if (err) return console.log("Data Error : ", err);
    if (!data){
        Data.create({name:"mydata", count:0}, function(err, data){
            if (err) return console.log("Data Error : ", err);
            console.log("Counter Initializer : ", data);
        });
    }
});


//view engine setting
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

//var data = {count:0}
app.get("/", function(req, res){
    Data.findOne({name:"mydata"}, function(err, data) {
        if(err) return console.log("Data Error : ", err);

        console.log(data);

        if (data) {
            data.count++;
            data.save(function (err) {
                if (err) return console.log("Data Error : ", err);
                res.render("my_first_ejs", data);
            });
        }
    });
});

app.get("/reset", function(req, res){
    setCounter(res, 0);
});

app.get("/set/count", function(req, res){
    console.log(req.query.count);
    if(req.query.count) setCounter(res, req.query.count);
    else getCounter(res);
});

app.get("/set/:num", function(req, res){
    console.log(req.params);
    if (req.params.num) setCounter(res, req.params.num);
    else getCounter(res);
});


function setCounter(res, num){
    console.log("setCounter");

    Data.findOne({name:"mydata"}, function(err, data){
        if(err) return console.log("Data error : ", err);
        data.count = num;
        data.save(function(err){
            if (err) return console.log("Data Error : ", err);
            res.render("my_first_ejs", data);
        });
    });
}

function getCounter(res){
    console.log("getCounter");
    Data.findOne({name:"mydata"}, function(err, data){
        if (err) console.log("Data Error : ", err);
        res.render("my_first_ejs", data);
    });
}

console.log(__dirname);
app.listen(3000, function(){
    console.log("Server On!")
})
