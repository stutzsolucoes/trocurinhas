// Gerente de acessos ao db. Pode ser utilizado para diferentes providers
// 2014 Guilherme G


var dbProvider = require('./dbProvider');
var _self = this;

if(_self.db == null){
	_self.db = dbProvider.getDb();
	console.log('conectado ao mongodb');
	// console.log(_self.db);
}

module.exports.save = function(object) {
	console.log('vou persistir no mongo ...');
	
	_self.db.collection('trocurinhas').insert(object, function(err,result){
		if(err == null) {
			console.log('usuário salvo com sucesso !');
		} else {
			console.log(err);
			return err;
		}
	});
}

module.exports.findAll = function(callback) {

	_self.db.collection('trocurinhas').find().toArray(function(err, usuarios){
		if(err == null) {
			callback(err, usuarios);
		} else {
			console.log(err);				
		}		
	});
}

module.exports.update = function(object, id) {
	console.log('vou atualizar no mongo ...');

	// prepara o JSON para o formato mongoDB
	var setParm = { $set: object};

	_self.db.collection('trocurinhas').updateById(id, setParm, function(err, resultado){
		(err == null) ? console.log('atualizado com sucesso!') : console.log(err)
	});
}
