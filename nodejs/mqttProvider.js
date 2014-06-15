// Provedor de objetos de conexão ao broker MQTT
// 2014 Guilherme G. Rocha

var _self = this;
_self.mqtt = require('mqtt');


module.exports.configurar = function(host, porta, usuario, senha){
	_self.host = host;
	_self.porta = porta;
	_self.usuario = usuario;
	_self.senha = senha;
}

module.exports.criarCliente = function() {
	var cliente = _self.mqtt.createClient(_self.porta, _self.host, { keepalive:10000 , username: _self.usuario , password: _self.senha });
	return cliente;
}
