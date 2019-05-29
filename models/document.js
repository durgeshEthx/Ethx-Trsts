var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var docSchema = new Schema({

  path:  { type: String }
 
  });

module.exports = mongoose.model('document', docSchema);