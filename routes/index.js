var mongoose = require('mongoose');
var express = require('express');
var router =  express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs-extra');
var db = require('mongodb').db;
var upload    = require('./upload');

var Document = require('../models/document');


const multer = require('multer');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login'});
});

router.get('/register', function(req, res, next) {//var Photo = mongoose.model('Photos');
  res.render('register', { title: 'Create Account' });
});

router.post('/register', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email must be valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(password);


  var errors = req.validationErrors();
  if(errors){
  	res.render('register', {
  		errors: errors,
  		title: "Create Account"
  	});
  }else{
    console.log('called');
  	passport.authenticate('local-register', {
      userProperty:username,
      successRedirect: '/dashboard',
      failureRedirect: '/',
      failureFlash: false // to show message on fail
    })(req, res, next);
  }
  
});

router.post('/login', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  console.log('username '+username);
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  var flag = 0;
  passport.authenticate('local-login', {
    body:'username',
    successRedirect: flag =  ('/dashboard'),
    failureRedirect: '/',
    failureFlash: true,
  })(req, res, next);

  if(flag == 1){
    res.render('/dashboard',{
      username : username
    })
  }

});

router.get('/logout', function(req, res, next){
  req.logout();
  req.flash('success', 'Logged out successfully');
  res.redirect('/');
});



router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Dashboard' , layout: 'dashboard_layout'});
});


router.post('/upload', function(req, res) {

  upload(req, res,(error) => {
      if(error){
        console.log('ERROR '+error);
         res.redirect('/dashboard');
      }else{
        if(req.file == undefined){
          
          res.redirect('/dashboard');

        }else{
             console.log('creating rec.')
            /**
             * Create new record in mongoDB
             */
            var fullPath = "files/"+req.file.filename;
            
            var d = {
              path:     fullPath
              
            };
           
          var doc = new Document(d); 
        
          doc.save(function(error){
            if(error){ 
              throw error;
            } 
            res.redirect('/dashboard');
         });
      }
    }
  });    
});
/* GET home page. */
router.get('/preview', function(req, res, next) {

  Photo.find({}, ['path'], {sort:{ _id: -1} }, function(err, doc) {
    res.render('index', { title: 'NodeJS file upload tutorial', msg:req.query.msg, doclist : doc });
    
  });

});
// // SET STORAGE
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null,file.fieldname + '-' + Date.now())
   
//   }
// })
 
// var upload = multer({ storage: storage });
// router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
//   const file = req.file
//   if (!file) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//   }
//    // res.send(file)
   
//    console.log('dash'+ req.file.originalname);
//    res.redirect('/dashboard');
  
// });

// router.post('/uploadphoto', upload.single('picture'), (req, res ) => {
//   console.log('0');
//   var img = fs.readFileSync(req.file.path); 
// var encode_image = img.toString('base64');
// // Define a JSONobject for the image attributes for saving to database

// var finalImg = {
//     contentType: req.file.mimetype,
//     image:  new Buffer(encode_image, 'base64') 
//  };
 
//   db.collection('testdb').insertOne(finalImg, (err, result) => {
//   console.log(result)
//   console.log('1');
//   if (err) return console.log(err)

//   console.log('saved to database');
//   res.redirect('/dashboard');
 
   
// });
// });

module.exports = router;
