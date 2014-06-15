// Responsável por publicar a mensagem no tópico/fila informado
// 2014 Guilherme G. Rocha

var _self = this;

module.exports.publicar = function(msg, topic, mqttObject) {
	mqttObject.publish(topic, msg);
}
