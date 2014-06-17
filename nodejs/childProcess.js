var publicador = require('./publicador');
var provider = require('./mqttProvider');

var _self = this;

// configuração do objecto de conexão MQTT a ser criado
provider.configurar('gostutz.com', 61613, 'user', 'user');
// solicita criação do objeto para salvá-lo no contexto
_self.cliente = provider.criarCliente();

process.on('message', function(m){

    var usuarios = m.usuarios;
    var clientUUID = m.clientUUID;
    var broadcastMsg = "";

    usuarios.forEach(function(u){
        console.log(JSON.stringify(u));
        broadcastMsg = JSON.stringify(u);
        // realizo a distribuição da mensagem
        console.log('publicadorUsuariosOnline: usuários recuperados !');
        publicador.publicar(broadcastMsg , '/clients/' + clientUUID , _self.cliente); 
        console.log('publicadorUsuariosOnline: mensagem publicada !')
    })
});
