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

	_self.triggerTransition = function(actionTrigger) {
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
		_self.triggerTransition("confirm");
	}
	_self.cancelAction = function() {
		_self.triggerTransition("cancel");
	}

	_self.bring = function() {
		_self.parentViewModel.currentInteraction(_self);		
	}
}
