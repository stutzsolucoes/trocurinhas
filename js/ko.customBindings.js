ko.bindingHandlers.visibleInOut = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) $(element).show();
    value ? $(element).animate({ left: '0%',}, 300) : $(element).animate({ left: '-100%',}, 300, function() {if (!value) $(element).hide()});
  }
}

ko.bindingHandlers.visibleOutIn = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) {
    	$(element).show();
    	$(element).css("left", "100%");
    }
    value ? $(element).animate({ left: '0%',}, 300) : $(element).animate({ left: '100%',}, 300, function() {if (!value) $(element).hide()});
  }
}