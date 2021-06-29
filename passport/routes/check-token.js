'use strict';

const express = require('express');
const service = require('../service');
const router = express.Router();
var UserModel = require('../models/user').User;
var crypto = require('crypto');
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
  console.log('check token');
  var token = req.query.token;
  var result = {
    error: 1, //登录失败
  };
  let condition = {
        token: token
    };
  UserModel.findOne(condition, function (err, doc) {
    if (err) {
        console.log(err);
        res.json(result);
      } else {
          if (doc) {
              if(doc.username){
                console.log('find user:'+doc.username);                 
                result.error = 0;
                result.username = doc.username;
                result.userid=doc.userid;
                result.password = doc.password;
                res.json(result);
              }
          } else {
              console.log('no token');
              res.json(result);
          }
      }
    });
});

module.exports = router;
