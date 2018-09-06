/**
 * Created by junelee on 2018-08-31.
 */
var mongoose = require("mongoose");

//몽고DB 설정
mongoose.connect("mongodb://my_node_test:l10045504j@ds239412.mlab.com:39412/juni_node_db", { useNewUrlParser: true }, function(err){
    if (err) {
        console.error('mongodb connection error', err);
    }
});

var db = mongoose.connection;
console.log(db);

db.on("error", function(err){
    console.log("DB ERROR : ". err)
});
db.once("open", function(){
    console.log("DB Connected");
});