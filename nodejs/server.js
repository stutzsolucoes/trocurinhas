// Tratamento de eventos Trocurinhas.com
// Objetivos:
// - Processamento das mensagens não classificadas de conexão.
// - Inicio dos processos paralelos de controle do agente de mensagens.
// 2014 Guilherme G. Rocha

var cp = require('child_process');

// processa usuários online para envio ao broker MQTT
var publicadorUsuariosOnline = cp.fork('./publicadorUsuariosOnline');
// gerencia desconexões de usuários
var processadorDeDesconexoes = cp.fork('./processadorDeDesconexoes', ['/clients/+/lastwill']);
// gerente da troca de mensagens
var gerenteDeMensagens = cp.fork('./gerenteDeMensagens',['/clients/+/messages'])

var provider = require('./mqttProvider');
var dbManager = require('./dbManager');

var _self = this;
// salva no contexto identificação do processo
_self.whoami = process.argv[1];

// configuração do objecto de conexão MQTT a ser criado
provider.configurar('gostutz.com', 61613, 'user', 'user');
// solicita criação do objeto para salvá-lo no contexto
_self.cliente = provider.criarCliente();

// quando conectado ...
_self.cliente.on('connect', function(){
  	console.log(_self.whoami + ' ' + "conectado ao broker MQTT !");	
  	console.log(_self.whoami + ' ' + 'vou me subscrever ... ');
  	// me subscrevo no tópico de conexões
  	_self.cliente.subscribe('/main/notclassified');

  	console.log(_self.whoami + ' ' + 'subscrito em /main/notclassified!');
});

// ao receber uma mensagem ...
_self.cliente.on('message', function (topic, message) {

	console.log(_self.whoami + ' ' + 'mensagem recebida !!! ' + topic);
	var msgJSON = JSON.parse(message);
	console.log(_self.whoami + ' ' + 'mensagem do cliente: ' + msgJSON.clientUUID);
  	console.log(_self.whoami + ' ' + 'firstMessage: ' + msgJSON.firstMessage)
  	// Caso seja a primeira mensagem do usuário, inclui no mongoDB 
  	if(msgJSON.firstMessage) {
    		// persisto no mongoDB - Async
    		dbManager.save(msgJSON);
    		// Recuperando todos os usuários - Async
    		console.log(_self.whoami + ' ' + 'recuperando usuários ...') 
    		dbManager.findAll(function(err, usuarios) {
      			if(err == null) {

        			// envio todos os usuários conectados para o cliente
        			publicadorUsuariosOnline.send({usuarios: usuarios, clientUUID: msgJSON.clientUUID});
  
      			} else {

        			console.log(err);

      			}
    		});

  	} else {
    		// atualizo no mongoDB - Async
    		dbManager.update(msgJSON , msgJSON.clientUUID);
  	}

});
