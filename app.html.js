/*** utils ***/
/** GUID GENERATOR * */
var generateUUID = (function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16)
				.substring(1);
	}
	return function() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4()
				+ s4() + s4();
	};
})();
/*** /END utils ***/

//***** VIEW VIEWMODELS ******//
/** -- INTERNAL VIEW MODELS -- **/
//sections view interaction
InteractionModelState = function(view, cancelButtonText, confirmButtonText, onenter, onexit) {
	this.view = view;
	this.cancelButtonText = typeof cancelButtonText !== 'undefined' ? cancelButtonText : null;
	this.confirmButtonText = typeof confirmButtonText !== 'undefined' ? confirmButtonText : null;
	this.onenter	= typeof onenter !== 'undefined' ? onenter : null;
	this.onexit	= typeof onexit !== 'undefined' ? onexit : null;
}
InteractionModelTransition = function(fromState, toState, trigger, onactivate) {
	this.fromState = fromState;
	this.toState = toState;
	this.trigger = trigger;
	this.onactivate	= typeof onactivate === 'function' ? onactivate : null;
}
InteractionModel = function(globalViewModel, interactionId, defaultState) {		
	var _self = this;

	_self.parentViewModel = globalViewModel;
	_self.id = interactionId;

	//The app presents one view (state) at a time. Just initializing; it will be handled by interaction models
	_self.currentState = ko.observable(defaultState); 

	_self.transitions = new Array();
	_self.addTransition = function(fromState, toState, trigger, onactivate) {
		_self.transitions.push(new InteractionModelTransition(fromState, toState, trigger, onactivate));
	}

	_self.resolveTransition = function(actionTrigger) {
		foundTransition = $(_self.transitions).filter(function() {
			return (this.fromState.view==_self.currentState().view && this.trigger==actionTrigger);
		});
		if (foundTransition.length!=1) {
			alert("erro na montagem da maquina de estados da interação");
			return false;
		}
		
		if (typeof foundTransition[0].fromState.onexit === 'function') {
			foundTransition[0].fromState.onexit();
		}
		if (typeof foundTransition[0].onactivate === 'function') {
			foundTransition[0].onactivate();
		}

		if (foundTransition[0].toState!=null) { 
			if (typeof foundTransition[0].toState.onenter === 'function') {
				foundTransition[0].toState.onenter();
			}
			_self.currentState(foundTransition[0].toState);
		}else{ //if found a transititon but the 'toState' is null, then it changes the interaction to the AppModel default interaction
			_self.parentViewModel.openDefaultInteraction();
		}
		
	}
	_self.confirmAction = function() {
		_self.resolveTransition("confirm");
	}
	_self.cancelAction = function() {
		_self.resolveTransition("cancel");
	}

}

/** SELECTABLE ITEMS MODEL - Needed and Available Stickers * */
function SelectableItemsViewModel(viewId, viewPageTitle, storageName0, defaultItems) {
	var _self = this;

	_self.id = viewId;
	_self.pageTitle = viewPageTitle;

	var _observable = ko.observable(0);
	_self.items = new ko.observableArray();
	_self._observable = ko.observable(0);
	_self._dirty = false;
	storageName = storageName0;

	// recover previous selected state from storage
	var _plainItems = defaultItems;
	if(storageName!=null) {
		var _storedJson = localStorage[storageName + "-items"];
		if (_storedJson != null) {
			var resItems = JSON.parse(_storedJson);
			if (resItems != null && resItems.length > 0) {
				_plainItems = resItems;
			}
		}
	}

	// transform plain items array to observable
	for ( var i = 0; i < _plainItems.length; i++) {
		var oi = SelectableItemsViewModel._createObservableItem(
				_plainItems[i].number, _plainItems[i].selected, this);
		_self.items.push(oi);
	}

	// store changes locally and notify peers from time to time when something
	// has changed
	window.setInterval(function() {
		if (_self._dirty) {
			// store changes locally
			var recItems = new Array();
			for ( var i = 0; i < _self.items.length; i++) {
				recItems.push({
					number : _self.items[i].number,
					selected : _self.items[i].selected()
				});
			}
			if(storageName!=null) {
				localStorage[storageName + "-items"] = JSON.stringify(recItems);
			}

			// notify listeners about changes
			_self._observable(new Date().getTime());

			_self._dirty = false;
		}
	}, 3000);

}

SelectableItemsViewModel.prototype.subscribeToChanges = function(callbackFunction) {
	this._observable.subscribe(callbackFunction);
};

SelectableItemsViewModel.prototype.toggleSelection = function(item) {
	item.selected(!item.selected());
};

SelectableItemsViewModel._createObservableItem = function(itemNumber, itemSelected,
		viewModel) {
	var observableSelected = ko.observable(itemSelected);

	// store changes as they are done
	observableSelected.subscribe(function(newValue) {
		viewModel._dirty = true;
	});

	return {
		number : itemNumber,
		selected : observableSelected
	};
};

/** CONNECT VIEW MODEL * */
function ConnectViewModel(viewId, viewPageTitle) {
	var _self = this;
	_self.id = viewId;
	_self.pageTitle = viewPageTitle;
}

/** NEAR PEOPLE TO EXCHANGE VIEW MODEL * */
function NearPeopleViewModel(viewId, viewPageTitle) {
	var _self = this;
	_self.id = viewId;
	_self.pageTitle = viewPageTitle;
}

/** EXCHANGING STICKERS VIEW MODEL * */
function ExchangingArenaViewModel(viewId, viewPageTitle) {
	var _self = this;
	_self.id = viewId;
	_self.pageTitle = viewPageTitle;
}

/** end of -- INTERNAL VIEW MODELS -- **/

/** -- GLOBAL VIEW MODEL -- **/
function AppViewModel() {

	var _self = this;

	var _defaultItems1 = new Array();
	for ( var i = 1; i <= 600; i++) {
		_defaultItems1.push({
			number : i,
			selected : false
		});
	}

	var _defaultItems2 = new Array();
	for ( var i = 1; i <= 600; i++) {
		_defaultItems2.push({
			number : i,
			selected : false
		});
	}

	// create and store an uid for this application for later reuse
	_self.clientUUID = localStorage["clientUUID"];
	if (_self.clientUUID == null) {
		_self.clientUUID = generateUUID();
		localStorage["clientUUID"] = _self.clientUUID;
	}
	
	//views ~ <section>
	//#1 - needed stickers
	_self.viewNeededStickers = new SelectableItemsViewModel(1, "Figurinhas Faltando", "needed-stickers", _defaultItems1);
	_self.viewNeededStickers.subscribeToChanges(function() {_self.publishStickersInfoToServer()});
	_self.viewNeededStickers.subscribeToChanges(function() {_self.recalculateStickersInfoRanking()});

	//#2 - available stickers
	_self.viewAvailableStickers = new SelectableItemsViewModel(2, "Figurinhas Repetidas", "available-stickers", _defaultItems2);
	_self.viewAvailableStickers.subscribeToChanges(function() {_self.publishStickersInfoToServer()});
	_self.viewAvailableStickers.subscribeToChanges(function() {_self.recalculateStickersInfoRanking()});

	//#3 - connect form
	_self.viewConnect = new ConnectViewModel(4, "Conectando-se");

	//#4 - list with people in the same neighborhood
	_self.viewNearPeople = new NearPeopleViewModel(5, "Pessoas próximas");

	//#5 - selecting stickers you want and you are giving
	_self.viewExchangingArena = new ExchangingArenaViewModel(6, "Trocando Figurinhas");

	// /END OF views ~ <section>

	//section interaction ~ <article>
	//#1 - first time the app is loaded interaction
	selectNeededStickersState = new InteractionModelState(_self.viewNeededStickers, null, "avançar");	
	selectAvailableStickersState = new InteractionModelState(_self.viewAvailableStickers, "voltar", "concluir");
	_self.interactionWelcome = new InteractionModel(_self, 1, selectNeededStickersState);	
	_self.interactionWelcome.addTransition(selectNeededStickersState, selectAvailableStickersState, "confirm");
	_self.interactionWelcome.addTransition(selectAvailableStickersState, selectNeededStickersState, "cancel");
	_self.interactionWelcome.addTransition(selectAvailableStickersState, null, "confirm", function() {
		_self.firstTimeRunning(false);
		localStorage["firstTimeFlag"] = 0;
	});

	//#2 - checking the stickers needed to complete the collection allowing to mark the ones got to remove them from the list
	selectNeededStickersStateNoAction = new InteractionModelState(_self.viewNeededStickers);
	_self.interactionNeededStickers = new InteractionModel(_self, 2, selectNeededStickersStateNoAction);

	//#3 - checking the stickers that are available to exchange allowing to mark the ones that are no available anymore to remove them from the list
	selectAvailableStickersStateNoAction = new InteractionModelState(_self.viewAvailableStickers);
	_self.interactionAvailableStickers = new InteractionModel(_self, 3, selectAvailableStickersStateNoAction);

	//#4 - connect (if not), locate people, choose one and exchange the stickers by marking the ones the user will got from the other peer and the ones the user is giving
	connectingState = new InteractionModelState(_self.viewConnect);
	chosingPeerState = new InteractionModelState(_self.viewNearPeople);
	exchangingState = new InteractionModelState(_self.viewExchangingArena);
	_self.interactionExchangeNow = new InteractionModel(_self, 4, connectingState);
	_self.interactionExchangeNow.addTransition(connectingState, chosingPeerState, "connect");
	_self.interactionExchangeNow.addTransition(chosingPeerState, exchangingState, "exchange");
	_self.interactionExchangeNow.addTransition(exchangingState, chosingPeerState, "cancelExchange");

	//checks if it is first time running the App
	_self.firstTimeRunning = ko.observable(localStorage["firstTimeFlag"] == undefined ? true : false);
	if (_self.firstTimeRunning()) {
		_self.currentInteraction = ko.observable(_self.interactionWelcome);
	}else{
		_self.currentInteraction = ko.observable(_self.interactionNeededStickers);
	}

	_self.openDefaultInteraction = function() {
		_self.currentInteraction(_self.interactionNeededStickers);
	}

	//MQTT Stuff
	_self.mqttClient = null;
	_self.mqttConnected = false;
	_self.mainTopicName = "/main/notclassified";

	_self.nickname = localStorage["nickname"];
	_self.place = localStorage["place"];
	_self.selfInfo = localStorage["selfInfo"];

	this.receivedStickersInfo = new Array();
	this.receivedStickersScreen = ko.observableArray();

	this.selectedReceivedStickersInfo = null;

	//update elapsed time informations
	window.setInterval(function() {
		//add time messages
		for(var i=0; i<_self.receivedStickersInfo.length; i++) {
 			var stickersInfo = _self.receivedStickersInfo[i];
			var info = "";
			var timeElapsed = new Date().getTime() - stickersInfo.time;
			if(timeElapsed < 60000) {
				info = "Há poucos segundos";
			} else if(timeElapsed < 3600000) {
				info = "Há "+ Math.ceil(timeElapsed/60000) +" minutos";
			} else if(timeElapsed >= 3600000) {
				info = "Há "+ Math.ceil(timeElapsed/3600000) +" horas";
			}
			stickersInfo.timeElapsedInfo(info);
		}
	}, 5000);
}

AppViewModel.prototype.connectAndPublishSelfInfo = function() {
	var _self = this;
	this.connectToMQTTServer(this.mainTopicName, function() {
		_self.publishStickersInfoToServer();
	});
}

AppViewModel.prototype.publishStickersInfoToServer = function() {
	if(this.mqttConnected) {
		console.log("Preparing stickers info...");
		var _self = this;
		var stickersInfo = {
			clientUUID: _self.clientUUID,
			time: new Date().getTime(),
			nickname: _self.nickname.peek(),
			place: _self.place.peek(),
			selfInfo: _self.selfInfo.peek(),
			neededStickers: AppViewModel.getOnlySelectedItems(_self.neededStickersModel.items),
			availableStickers: AppViewModel.getOnlySelectedItems(_self.availableStickersModel.items)
			//stickersForReceivingFromPeer: Array - used later during ranking calculations
			//stickersForGivingToPeer: Array - used later during ranking calculations
		}
		console.log("Publishing stickers info to MQTT server...");
		this.publishToMQTTServer(this.mainTopicName, JSON.stringify(stickersInfo));
	} else {
		console.log("Not connected to server");
	}
}
AppViewModel.getOnlySelectedItems = function(items) {
	var result = new Array();
	for(var i=0; i<items.length; i++) {
		if(items[i].selected()) {
			result.push(items[i]);
		}
	}
	return result;
}

AppViewModel.getOnlySelectedItems = function(items) {
	var result = new Array();
	for(var i=0; i<items.length; i++) {
		if(items[i].selected()) {
			result.push(items[i]);
		}
	}
	return result;
}

AppViewModel.prototype.disconnectFromMQTTServer = function() {
	if(this.mqttClient!=null) {
		console.log("Disconnecting from MQTT server...");
		try {
			this.mqttClient.disconnect();
			this.mqttClient = null;
			this.mqttConnected = false;
			this.showResultados();
 		} catch (e) {
 			console.log(e);
 		}
 	}
}

AppViewModel.prototype.connectToMQTTServer = function(mainTopicName, onSuccess) {
	//store info for later use
	localStorage["nickname"] = this.nickname();
	localStorage["place"] = this.place();
	localStorage["selfInfo"] = this.selfInfo();

	//connect to mqtt server
	var _self = this;
	this.disconnectFromMQTTServer();
	this.mqttClient = new Messaging.Client("gostutz.com", 61623, new Date().getTime()+"");
	var options = {
		timeout : 10,
		onSuccess : function() {
			try {
				_self.mqttConnected = true;
				console.log("Subscribing to '"+mainTopicName+"'...");
				_self.mqttClient.subscribe(mainTopicName);
				if(onSuccess) {
					onSuccess.call();
				}
				_self.showPessoas();
			} catch (e) {
				console.log(e);
			}
		},
		onFailure : function(responseObject) {
			_self.mqttConnected = false;
			console.log("Failure:"+responseObject.errorCode+" "+responseObject.errorMessage);
		},
		userName: "user",
		password: "user",
		useSSL: false
	};
	var _self = this;
	this.mqttClient.onMessageArrived = function(message) {
		try {
			console.log("Message arrived: " + message.payloadString);
			stickersInfo = JSON.parse(message.payloadString);
			stickersInfo.timeElapsedInfo = ko.observable("Há poucos segundos");
			
			//remove previous results from peer
			var index = -1;
			for(var i=0; i<_self.receivedStickersInfo.length; i++) {
				if(stickersInfo.clientUUID==_self.receivedStickersInfo[i].clientUUID) {
					index = i;
				}
			}
			
			if(index > -1) {
				_self.receivedStickersInfo.splice(index,1);
			}
			
			_self.receivedStickersInfo.push(stickersInfo);
			_self.recalculateStickersInfoRanking();
		} catch(e) {
			console.log(e);
		}
	};
	this.onConnectionLost = function(message) {
		console.log("Connection lost:"+message.errorCode + " " +responseObject.errorMessage);
	};

	console.log("Connecting to MQTT server...");
	this.mqttClient.connect(options);
}
AppViewModel.prototype.publishToMQTTServer = function(topicName, payload) {
	var message = new Messaging.Message(payload);
	message.destinationName = topicName;
	this.mqttClient.send(message); 
}

//perform balance line matches and ranking seeking for the best people that could exchange stickers with the user
AppViewModel.prototype.recalculateStickersInfoRanking = function() {
	if(this.receivedStickersInfo!=null && this.neededStickersModel!=null && this.availableStickersModel!=null) {

		//look for stickers that the current user needs and are available from others
		for(var i=0; i<this.receivedStickersInfo.length; i++) {
			var receivedStickerInfo = this.receivedStickersInfo[i];
			receivedStickerInfo.stickersForReceivingFromPeer = new Array();
			receivedStickerInfo.stickersForGivingToPeer = new Array();
	
			//find stickers that the current user could get from other peers
			for(var j=0; j<this.neededStickersModel.items.length; j++) {
				var neededStickerByUser = this.neededStickersModel.items[j];
		
				for(var k=0; k<receivedStickerInfo.availableStickers.length; k++) {
					var availableStickerFromPeer = receivedStickerInfo.availableStickers[k];
					if(neededStickerByUser.number==availableStickerFromPeer.number && neededStickerByUser.selected()) {
						receivedStickerInfo.stickersForReceivingFromPeer.push({number: availableStickerFromPeer.number, selected:true});
					}
				}
			}

			//find stickers that the current user could give to other peers
			for(var j=0; j<this.availableStickersModel.items.length; j++) {
				var availableStickerByUser = this.availableStickersModel.items[j];
		
				for(var k=0; k<receivedStickerInfo.neededStickers.length; k++) {
					var neededStickerFromPeer = receivedStickerInfo.neededStickers[k];
					if(availableStickerByUser.number==neededStickerFromPeer.number && availableStickerByUser.selected()) {
						receivedStickerInfo.stickersForGivingToPeer.push({number: availableStickerByUser.number, selected:true});
					}
				}
			}
		}

		//order ranking by best matches
		if(this.receivedStickersInfo.length>0) {
			this.receivedStickersInfo.sort(function(left,right) {
				if(left.stickersForReceivingFromPeer.length > right.stickersForReceivingFromPeer.length) {
					return 1;
				} else {
					return -1;
				}
			});
			
			//update screen items
			this.receivedStickersScreen.removeAll();
			for(var i=0; i<this.receivedStickersInfo.length; i++) {
				this.receivedStickersScreen.push(this.receivedStickersInfo[i]);
			}
		}
	}

}

AppViewModel.prototype.showSection = function(elementId) {
	$("article").hide(); //hide all articles (app pages)
	$("#"+elementId).show();
}
AppViewModel.prototype.showFaltandoSection = function() {
	this.currentSection(this.interactionNeededStickers);
}
AppViewModel.prototype.showRepetidaNeededStickers = function() {
	this.currentSection(this.interactionAvailableStickers);
}
AppViewModel.prototype.showTrocarAgoraSection = function() {
	if (this.mqttConnection == null) {
		this.currentSection(this.conexaoSection);
	} else {
		this.currentSection(this.listaMatchesSection);
	}
}
AppViewModel.prototype.showPessoas = function() {
	showSection("lista-matches");
	document.getElementById("pessoas").style.display = "none";
	document.getElementById("arena-troca").style.display = "block";
}
AppViewModel.prototype.showArenaTroca = function() {
	showSection("lista-matches");
	document.getElementById("pessoas").style.display = "none";
	document.getElementById("arena-troca").style.display = "block";
}


//***** /end of VIEW VIEWMODELS ******//






