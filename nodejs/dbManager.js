// Gerente de acessos ao db. Pode ser utilizado para diferentes providers
// 2014 Guilherme G


var dbProvider = require('./dbProvider');
var _self = this;

if(_self.db == null){
	_self.db = dbProvider.getDb();
}

// insere um registro no mongoDB
module.exports.save = function(object) {
	
	_self.db.collection('trocurinhas').insert(object, function(err,resultado){
		if(err == null) {
			console.log('usuário salvo com sucesso !' + JSON.stringify(resultado));
		} else {
			console.log(err);
		}
	});
}

// Recupera todos os registros no mongoDB
module.exports.findAll = function(callback) {

	_self.db.collection('trocurinhas').find().toArray(function(err, usuarios){
		if(err == null) {
			callback(err, usuarios);
		} else {
			console.log(err);				
		}		
	});
}

// atualiza todos os registros para o cliente com o clientUUID recebido de parâmetro
module.exports.update = function(object, clientUUID) {

	var findQuery = {clientUUID: clientUUID};

	// prepara o JSON para o formato mongoDB
	var setParm = {$set: object};

	_self.db.collection('trocurinhas').update(findQuery, setParm, {upsert: false}, function(err, resultado){
		(err == null) ? console.log('atualizado com sucesso! ' + resultado) : console.log(err)
	});
}

// remove todos os registros para o clientUUID recebido de parâmetro
module.exports.remove = function(clientUUID){

	_self.db.collection('trocurinhas').remove({clientUUID: clientUUID} , function(err, resultado){
		(err == null) ? console.log('removido com sucesso! ' + resultado) : console.log(err)
	});

};
