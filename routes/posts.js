var express        = require("express");
var router          = express.Router();
var mongoose       = require("mongoose");
var Post             = require("../models/Post.js");

router.get('/', function(req, res){
    Post.find({}).populate('author').sort('-createdAt').exec(function(err, posts){
        if (err) return res.json({success:false, message:err});
        res.render("posts/index", {posts:posts, user:req.user});
    });
}); //index

router.get('/new', isLoggedIn, function(req, res){
    res.render("posts/new", {user:req.user});
});

router.post('/', isLoggedIn, function(req, res){
    req.body.post.author = req.user._id;
    Post.create(req.body.post, function(err, post){
        if (err) return res.json({success:false, message:err});
        res.redirect("/posts/index", {data:post, user:req.user});
    });
}); //create

router.get('/:id', function(req, res){
    Post.findById(req.params.id).populate('author').exec(function(err, post){
        if(err) return res.json({success:false, message:err});
        res.render("posts/show", {post:post, user:req.user});
    });
}); //show

router.get('/:id/edit', isLoggedIn, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err) return res.json({success:false, message:err});
        if(!req.user._id.equals(post.author)) return res.json({success:false, message:"Unathorized Attempt"});
        res.render("posts/edit", {post:post, user:req.user});
    });
}); //edit

router.put('/:id', isLoggedIn, function(req, res){
    req.body.post.updatedAt = Date.now();

    //DB 한번만 호출할 수 있도록 수정
    Post.findOneAndUpdate({_id:req.params.id, author:req.user._id}, req.body.post, function (err, post) {
        if (err) return res.json({success:false, message:err});
        if (!post) return res.json({success:false, message:"No data found to update"});
        res.redirect('/posts/' + req.params.id);
    });

    /* DB 두번호출
    Post.findById(req.params.id, function (err, post) {
        if (err) return res.json({success:false, message:err});
        if(!req.user._id.equals(post.author)) return res,json({success:false, message:"Unauthorized Attempt"});
        Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
            if(err) return res.json({success:false, message:err});
            res.redirect('/posts/' + req.params.id);
        });
    });
    */
}); //update

router.delete('/:id', isLoggedIn, function(req, res){
    //DB 한번만 호출할 수 있도록 수정
    Post.findOneAndRemove({_id:req.params.id, author:req.user._id}, function (err, post) {
        if (err) return res.json({success:false, message:err});
        if (!post) return res.json({success:false, message:"No data found to update"});
        res.redirect('/posts/' + req.params.id);
    });

    /* DB 두번호춯
    Post.findById(req.params.id, function(err, post){
        if (err) return res.json({success:false, message:err});
        if (!req.user._id.equals(post.author)) return res.json({success:false, message:"Unathorized Attempt"});
        Post.findByIdAndRemove(req.params.id, function(err, post) {
            if (err) return res.json({success: false, message: err});
            res.redirect("/posts");
        });
    });
    */
}); //destroy

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/');
    }
}


module.exports = router;