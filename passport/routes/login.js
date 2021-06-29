'use strict';

const express = require('express');
const service = require('../service');
const router = express.Router();
var UserModel = require('../models/user').User;
var crypto = require('crypto');
/**请求其他页面**/
const request = require('request');
const passportSECRET = "passport";
const SECRET = "CrowdIntel";
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

router.get('/', function (req, res, next) {
  console.log("passport get!!!!");
  // 获得客户端的Cookie
  var Cookies = {};
  req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
      var parts = Cookie.split('=');
      Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  console.log(Cookies);
  let cookies = req.cookies;
  let token = cookies.token;
  console.log("passport.cookies.token="+token);
  if(!req.session.redirectUrl)
    req.session.redirectUrl=req.query.redirectUrl;
  console.log("req.session.redirectUrl:"+req.session.redirectUrl);
  let redirectUrl = req.query.redirectUrl;
  if(token){
    request(
      `http://passport.pintu.fun/check_token?token=${token}&t=${new Date().getTime()}`,
      function (error, response, data) {
        if (!error && response.statusCode === 200) {
          data = JSON.parse(data);
          if (data.error === 0) {
            // TODO 这里的 userId 信息应该是经过加密的，加密算法要么内嵌，要么从 passport 获取。这里为了操作简单，直接使用明文。
            let userName = data.username;
            console.log('get username:'+userName);
            if (!userName) {
              //res.redirect(`http://localhost:3008/login?redirectUrl=${req.headers.host + req.originalUrl}`);
              res.render('login',{ title: 'Login' });
              console.log('no userId redirect login');
              return;
            }
            if (redirectUrl) {
              console.log("has redirectUrl");
              console.log(`http://${redirectUrl}?token=${token}`);
              res.redirect(`http://${redirectUrl}?token=${token}`);
              req.session.redirectUrl = null;
              console.log('passort get pass redirect');
            } else {
             // TODO 如果不含有重定向页面，可以返回系统首页。这里直接返回一个登录成功的信息。
              res.send('<h1>登录成功!</h1>');
            }
          } else {
              // token 验证失败，重新去 passport 登录。
            //res.redirect(`http://localhost:3008/login?redirectUrl=${req.headers.host + req.originalUrl}`);
            res.render('login',{ title: 'Login' });
            console.log('data error redirect login');
            }
      } else {
        //res.redirect(`http://localhost:3008/login?redirectUrl=${req.headers.host + req.originalUrl}`);
        res.render('login',{ title: 'Login' });
        console.log('error==1,登录失败');
      }
    });
  }else{
    res.render('login',{ title: 'Login' });
  }

});

router.post('/', function (req, res, next) {
  let body = req.body;
  let name = body.username;
  let password = body.password;
  let url = body.url;
  console.log("passport post!!!!");
  console.log('post host:'+req.headers["host"]);
  console.log("name:"+name+",password:"+password);
  let passwd_enc = encrypt(password, SECRET);
  console.log('passwd_enc:'+passwd_enc);
  let condition = {
        username: name
    };
    UserModel.findOne(condition, function (err, doc) {
        if (err) {
            console.log(err);
            res.render('login',{ title: 'Login' });
        } else {
            if (doc) {
                if (doc.password === passwd_enc) {
                    // only save the username for safety
                    // TODO token 应该按照一定的规则生成，并持久化。
                    let randomNum = Math.floor((Math.random()*100)+1)+"";
                    let token = encrypt(name+randomNum, passportSECRET);
                    console.log('create token:'+token);
                    res.cookie('token', token, {
                    maxAge: 1000 * 60 * 60 * 24 * 3,
                    httpOnly: true
                    //domain: '127.0.0.1'
                    });
                    let condition1={
                    	username: name	
                    };
                    let operation1 = {
		            token: token
		        };
				UserModel.update(condition1,operation1,function(err,doc){
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
                } else {
                  var result = {
                  error: 1, //登录失败
                  msg:'用户或密码错误'
                  };
                  //res.json(result);
                  return res.redirect('http://' + req.query.redirectUrl);
                }
            } else {
                var result = {
                  error: 1, //登录失败
                  msg:'没有此用户'
                };
                //res.json(result);
                return res.redirect('http://' + req.query.redirectUrl);
            }
        }
    });

});

module.exports = router;
