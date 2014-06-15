var publicador = require('./publicador');
var provider = require('./mqttProvider');

var _self = this;

// configuração do objecto de conexão MQTT a ser criado
provider.configurar('gostutz.com', 61613, 'user', 'user');
// solicita criação do objeto para salvá-lo no contexto
_self.cliente = provider.criarCliente();

process.on('message', function(m){

	var i = 0;

	var usuarios = m.usuarios;
	var clientUUID = m.clientUUID;

	for (i; i < usuarios.length; i++) {
		console.log(JSON.stringify(usuarios[i]));
        var broadcastMsg = JSON.stringify(usuarios[i]);
        // realizo a distribuição da mensagem
        console.log('usuários recuperados !');
        publicador.publicar(broadcastMsg , '/teste/' + clientUUID , _self.cliente); 
        console.log('mensagem publicada !')
        console.log('índice: ' + i);
    }
});
