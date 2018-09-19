var express        = require("express");
var router          = express.Router();
var mongoose       = require("mongoose");
var User            = mongoose.model('user');
var async           = require("async");

router.get('/new', function(req, res){
    res.render('users/new', {
        formData : req.flash('formData')[0],
        emailError : req.flash('emailError')[0],
        nicknameError : req.flash('nicknameError')[0],
        passwordError : req.flash('passwordError')[0]
    });
});

router.post('/', checkUserRegValidation, function(req, res){
    User.create(req.body.user, function (err, user) {
        if(err) return res.json({success:false, message:err});
        res.redirect('/login');
    })
});

router.get('/:id', isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return res.json({success:false, message:err});
        res.render('users/show', {user:user});
    })
});

router.get('/:id/edit', isLoggedIn, function (req, res) {
    if (req.user._id != req.param._id) return res.json({success:false, message:"Unathorized Attempt"});
    User.findById(req.params.id, function (err, user) {
        if (err) return res.json({success:false, message:err});
        res.render('users/edit', {
            user : user,
            formData : req.flash('formData')[0],
            emailError : req.flash('emailError')[0],
            nicknameError : req.flash('nicknameError')[0],
            passwordError : req.flash('passwordError')[0]
        });
    });
});

router.put('/:id', function (req, res) {
    User.findById(req.params.id, req.body.user, function (err, user) {
        if (err) return res.json({success:false, message:err});
        if (user.authenticate(req.body.password)){
            if (req.body.user.newPassword){
                req.body.user.password = user.hash(req.body.user.newPassword);
            } else {
                delete req.body.user.password;
            }

            User.findByIdAndUpdate(req.params.id, req.body.user, function (err, user) {
                if (err) return res.json({success:false, message:err});
                res.redirect('/users/' + req.params.id);
            });
        } else {
            res.flash('formData', req.body.user);
            res.flash('passwordError', "- Invalid password");
            res.redirect('/users/' + req.params.id + "/edit");
        }
    });
});

//functions
function checkUserRegValidation(req, res, next){
    var isValid = true;

    async.waterfall(
        [function (callback) {
            User.findOne({email: req.body.user.email, _id: {$ne: mongoose.Types.ObjectId(req.params.id)}},
                function (err, user) {
                    if (user) {
                        isValid = false;
                        res.flash('emailError', '- This email is aleady registered.')
                    }
                    callback(null, isValid);
                });
        }, function (isValid, callback) {
            User.findOne({nickname: req.body.user.nickname, _id: {$nd: mongoose.Types.ObjectId(req.params.id)}},
                function (err, user) {
                    if(user){
                        isValid : false;
                        req.flash('nicknameError', '- This nickname is already registered');
                    }
                    callback(null, isValid);
                }
            );
        }], function (err, isValid) {
            if(err) return res.json({success:true, message:err});
            if(isValid){
                return next();
            } else {
                req.flash('formData', req.body.user);
                res.redirect('back');
            }
        }
    );
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;