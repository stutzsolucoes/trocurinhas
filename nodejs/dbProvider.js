// Provedor de objetos de conexão ao db
// 2014 Guilherme G. Rocha

var mongo = require('mongoskin');
var _self = this;

module.exports.getDb = function() {
	_self.db = mongo.db("mongodb://localhost:27017/trocurinhas", {native_parser:true});
	return _self.db;				
}
