'use strict';

const express = require('express');
const router = express.Router();
var UserModel = require('../models/user').User;
var crypto = require('crypto');
const passportSECRET = "passport";
const SECRET = "CrowdIntel";
/**请求其他页面**/
const request = require('request');
/**
 *  MD5 encryption
 *  let md5 = crypto.createHash("md5");
 *  let newPas = md5.update(password).digest("hex");
 */
function encrypt(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    // var enc=cipher.update(new Buffer(str, 'utf-8'));
    enc += cipher.final('hex');
    return enc;
}

function decrypt(str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

// Register
router.get('/', function (req, res, next) {
  console.log('server register');
  //let new_url = req.session.redirectUrl;
  //console.log(new_url);
  //跳到本地注册
  //return res.redirect('http://' + new_url +'register');
  res.render('register', {
      title: 'Register'
  });
});

router.post('/',function (req, res, next) {
    //从前端获取到的用户填写的数据
    console.log('get register post')
    if (req.body.password.replace(/[ ]/g, "").length == 0) {
        req.session.error = 'Passwords must not be empty!';
        return res.redirect('/register');
    }
	
    let passwd_enc = encrypt(req.body.password, SECRET);
    let passwd_sec_enc = encrypt(req.body.passwordSec+"", SECRET);

    let newUser = {
        username: req.body.username,
        password: passwd_enc,
        passwordSec: passwd_sec_enc
    };
    let token = encrypt(newUser.username, passportSECRET);
    //重定向地址
    let new_url = req.session.redirectUrl;
    console.log('new_url'+new_url);
    UserModel.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            if (docs) {
                let index = docs.length > 0 ? docs[docs.length-1].userid + 1: docs.length;
                //准备添加到数据库的数据（数组格式）
                let operation = {
                    userid: index,
                    username: newUser.username,
                    password: newUser.password,
                    token: token
                    //last_online_time: util.getNowFormatDate(),
                    //register_time: util.getNowFormatDate()
                };
                //用于查询用户名是否存在的条件
                // let selectStr={username:newUser.username};
                UserModel.findOne({
                    username: newUser.username
                }, function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (!doc) {
                            if (String(operation.username).replace(/[ ]/g, "").length == 0) {
                                //req.session.error = 'Username must not be empty!';
                                console.log('Username must not be empty!');
                                return res.redirect('/register');
                                //res.redirect(`http://localhost:8080/register?redirectUrl=${req.query.redirectUrl}`);
                            }
                            if (newUser.password === newUser.passwordSec) {
                                UserModel.create(operation, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        //req.session.error = 'Register success, you can login now!';
								console.log('Register success, you can login now!');
                                        //post到服务器等待验证
                                        // request.post({url:'http://'+new_url+'register', form:{
                                        //     "username": req.body.username,
                                        //     "password": req.body.password,
                                        //     "passwordSec": req.body.passwordSec
                                        // }}, function(error, response, data) {
                                        //     //data = JSON.parse(data);
                                        //     console.log(data);
                                        //     console.log(error);
                                        // });
                                        return res.redirect('/login?redirectUrl='+new_url);
                                        //console.log('http://' + req.query.redirectUrl);
                                        //return res.redirect('http://' + req.query.redirectUrl);
                                    }
                                });
                            } else {
                                req.session.error = 'Passwords do not agree with each other!';
                                console.log('Passwords do not agree with each other!');
                                return res.redirect('/register');
                                //res.redirect(`http://localhost:8080/register?redirectUrl=${req.query.redirectUrl}`);
                            }
                        } else {
                            req.session.error = 'Username exists, please choose another one!';
                            console.log('Username exists, please choose another one!')
                            return res.redirect('/register');
                            //res.redirect(`http://localhost:8080/register?redirectUrl=${req.query.redirectUrl}`);
                        }
                    }
                });
            }
        }
    });
});
module.exports = router;
