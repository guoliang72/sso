'use strict';
var UserModel = require('../models/user').User;
/**
 *
 * @param {String} token
 * @return {Boolean}
 */
function isTokenValid(token) {
  // TODO 从存储系统中查找相应 token 信息，判断 token 的合法性
    let condition = {
        token: token
    };
    UserModel.findOne(condition, function (err, doc) {
    	if (err) {
        	console.log(err);
    	} else {
        	if (doc) {
           		if(doc.username){
            		console.log('find user:'+doc.username);           			

           		}else{
           			console.log('no user');
           		} 	
        	} else {
          		console.log('no token');
        	}
    	}
  	});
}

module.exports = {
	isTokenValid,
};
