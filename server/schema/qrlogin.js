var mongoose = require('mongoose');
var Schema = mongoose.Schema,Ob
    ObjectId = Schema.ObjectId;

var QRLoginSchema = new Schema({
  id: ObjectId,
  sessionId: String,
  socketId: String, // Socket id used by the server to communicate with respective browser
  deviceToken: String, 
  accessToken: String,
  userAgent: String,
  createdDate: Date,
  expiryDate: Date
});

module.exports = QRLoginSchema;