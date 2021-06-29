'use strict';
const express = require('express');
const router = express.Router();
var UserModel = require('../models/user').User;
var crypto = require('crypto');
const passportSECRET = "passport";
const SECRET = "CrowdIntel";

function encrypt(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    // var enc=cipher.update(new Buffer(str, 'utf-8'));
    enc += cipher.final('hex');
    return enc;
}

// visitor
router.get('/', function (req, res, next) {
  console.log('visitor');
  if(!req.session.redirectUrl)
    req.session.redirectUrl=req.query.redirectUrl;
  console.log(req.session.redirectUrl);
  let redirectUrl = req.session.redirectUrl;
  UserModel.find(function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                if (docs) {
                    let index = docs.length > 0 ? docs[docs.length-1].userid + 1: docs.length;
                    let token = encrypt('Visitor#' + index, passportSECRET);
                    let operation = {
                        userid: index,
                        username: 'Visitor#' + index,
                        password: "",
                        token: token
                        //last_online_time: util.getNowFormatDate(),
                        //register_time: util.getNowFormatDate()
                    };
                    let user = {
                        username: operation.username
                    };
                    UserModel.create(operation, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                        	   	if (req.query.redirectUrl) {
		                      console.log('http://' + req.query.redirectUrl + '?token=' + token);
		                      console.log('passport post redirect success');
		                      return res.redirect('http://' + req.query.redirectUrl + '?token=' + token);
		                    } else if(req.session.redirectUrl){
		                      let aimUrl=req.session.redirectUrl;
		                      req.session.redirectUrl=undefined;
		                      return res.redirect('http://' + aimUrl + '?token=' + token);
		                    }else{
		                    console.log('post no redirect');
		                    var result = {
		                      error: 0, //登录成功
		                      msg:'登陆成功',
		                      token: token
		                    };
		                    res.json(result);
		                  }
                        }
                    });
                }
            }
        });
});


module.exports = router;
