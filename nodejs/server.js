// Tratamento de eventos Trocurinhas.com
// 2014 Guilherme G. Rocha

var cp = require('child_process');
var n = cp.fork('./childProcess');

var provider = require('./mqttProvider');
var dbManager = require('./dbManager');

var _self = this;

// configuração do objecto de conexão MQTT a ser criado
provider.configurar('gostutz.com', 61613, 'user', 'user');
// solicita criação do objeto para salvá-lo no contexto
_self.cliente = provider.criarCliente();
// console.log(_self.cliente);
// quando conectado ...
_self.cliente.on('connect', function(){
  	console.log("conectado !!");	
  	console.log('vou me subscrever ... ');
  	// me subscrevo no tópico de conexões
  	_self.cliente.subscribe('/main/notclassified');
  	console.log('subscrito !!');
});

// ao receber uma mensagem ...
_self.cliente.on('message', function (topic, message) {

	console.log('mensagem recebida !!!')
	var msgJSON = JSON.parse(message);
	console.log('mensagem do cliente: ' + msgJSON.clientUUID);
  console.log('firstMessage: ' + msgJSON.firstMessage)
  // Caso seja a primeira mensagem do usuário, inclui no mongoDB 
  if(msgJSON.firstMessage) {
    // persisto no mongoDB - Async
    dbManager.save(msgJSON);
  } else {
    // atualizo no mongoDB - Async
    dbManager.update(msgJSON , msgJSON.clientUUID);
  }

	// Recuperando todos os usuários - Async
	console.log('recuperando usuários ...') 
  dbManager.findAll(function(err, usuarios) {
    if(err == null) {

      n.send({usuarios: usuarios, clientUUID: msgJSON.clientUUID});
  
    } else {
    	console.log(err);
    }
  });
});
