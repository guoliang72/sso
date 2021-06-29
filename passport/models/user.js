const mongoose = require("mongoose"); 
// create the user schema
var UserSchema = new mongoose.Schema({
    userid: { type: Number, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // encrypted with crypto
    token: { type: String, required: true, unique: true},// encrypted with crypto
}, { collection: 'users' });

// UserSchema.set('collection', 'users');
// var User = mongoose.model('User', UserSchema, 'users');
console.log('[OK] User Schema Created.');

exports.User = mongoose.model('User', UserSchema);