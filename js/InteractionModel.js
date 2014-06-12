/** -- INTERNAL VIEW MODELS -- **/
//sections view interaction
InteractionModelState = function(view, cancelButtonText, confirmButtonText, onenter, onexit) {
	this.view = view;
	this.cancelButtonText = typeof cancelButtonText !== 'undefined' ? cancelButtonText : null;
	this.confirmButtonText = typeof confirmButtonText !== 'undefined' ? confirmButtonText : null;
	this.onenter	= typeof onenter !== 'undefined' ? onenter : null;
	this.onexit	= typeof onexit !== 'undefined' ? onexit : null;
}
InteractionModelTransition = function(fromState, toState, trigger, id, onactivate) {
	this.fromState = fromState;
	this.toState = toState;
	this.trigger = trigger;
	this.id = typeof id !== 'undefined' ? id : null;
	this.onactivate	= typeof onactivate === 'function' ? onactivate : null;
}
InteractionModel = function(globalViewModel, interactionId, defaultState) {		
	var _self = this;

	_self.parentViewModel = globalViewModel;
	_self.id = interactionId;

	//The app presents one view (state) at a time. Just initializing; it will be handled by interaction models
	_self.currentState = ko.observable(defaultState); 
	_self.currentTransition = ko.observable({id:null}); 

	_self.transitions = new Array();
	_self.addTransition = function(fromState, toState, trigger, id, onactivate) {
		_self.transitions.push(new InteractionModelTransition(fromState, toState, trigger, id, onactivate));
	}

	_self.triggerTransition = function(actionTrigger) {
		transitionsFound = $(_self.transitions).filter(function() {
			return (this.fromState.view==_self.currentState().view && this.trigger==actionTrigger);
		});
		if (transitionsFound.length!=1) {
			alert("erro na montagem da maquina de estados da interação");
			return false;
		}
		var transitionTrigerring = transitionsFound[0];
		if (typeof transitionTrigerring.fromState.onexit === 'function') {
			transitionTrigerring.fromState.onexit();
		}
		if (typeof transitionTrigerring.onactivate === 'function') {
			transitionTrigerring.onactivate();
		}

		if (transitionTrigerring.toState!=null) { 
			if (typeof transitionTrigerring.toState.onenter === 'function') {
				transitionTrigerring.toState.onenter();
			}

			//signaling the transition running
			_self.currentTransition(transitionTrigerring);

			//signaling the state activated
			_self.currentState(transitionTrigerring.toState);
			
		}else{ //if found a transititon but the 'toState' is null, then it changes the interaction to the AppModel default interaction
			_self.parentViewModel.openDefaultInteraction();
		}

	}
	_self.confirmAction = function() {
		_self.triggerTransition("confirm");
	}
	_self.cancelAction = function() {
		_self.triggerTransition("cancel");
	}

	_self.bring = function() {
		_self.parentViewModel.currentInteraction(_self);		
	}
}
