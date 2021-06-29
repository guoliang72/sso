'use strict';

const express = require('express');
const router = express.Router();
var UserModel = require('../models/user').User;
var crypto = require('crypto');
const passportSECRET = "passport";
const SECRET = "CrowdIntel";
/**请求其他页面**/
const request = require('request');

//logout
router.get('/', function (req, res, next) {
  console.log('server logout');
  req.cookies.token=null;
  res.clearCookie('token');
  req.session.redirectUrl=req.query.redirectUrl;
  let redirectUrl = req.query.redirectUrl;
  return res.redirect(`http://passport.pintu.fun/login?redirectUrl=${redirectUrl}`);
  
});


module.exports = router;
