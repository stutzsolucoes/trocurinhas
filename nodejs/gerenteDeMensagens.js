var provider = require('./mqttProvider');
var dbManager = require('./dbManager');

var _self = this;

// salva no contexto identificação do processo
_self.whoami = process.argv[1];

// recupero argumentos de entrada - Tópico para subscrição
_self.topico = process.argv[2];

// configuração do objecto de conexão MQTT a ser criado
provider.configurar('gostutz.com', 61613, 'user', 'user');
// solicita criação do objeto para salvá-lo no contexto
_self.cliente = provider.criarCliente();

// ao se conectar ...
_self.cliente.on('connect', function(){
    console.log(_self.whoami + ' conectado !!');
    _self.cliente.subscribe(_self.topico);
    console.log(_self.whoami + ' subscrito no topico: ' + _self.topico);
});    

// ao receber uma mensagem ...
_self.cliente.on('message', function (topic, message) {

    console.log(_self.whoami + ' mensagem recebida !!! ' + topic);
    console.log(message);
    // var msgJSON = JSON.parse(message);

});
