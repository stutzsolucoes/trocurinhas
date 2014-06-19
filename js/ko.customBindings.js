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
ko.bindingHandlers.visibleOutOut = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) {
      $(element).show();
      $(element).css("left", "-40%");
    }
    value ? $(element).animate({ left: '0%',}, 300) : $(element).animate({ left: '-40%',}, 300, function() {if (!value) $(element).hide()});
  }
}

ko.bindingHandlers.showLeftIn = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) {
      $(element).show();
      $(element).css("left", "-100%");
      $(element).animate({ left: '0%',}, 300);
    }
  }
}
ko.bindingHandlers.hideLeftOut = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) {
      $(element).show();
      $(element).css("left", "0%");
      $(element).animate({ left: '-100%',}, 300, function(){ $(this).hide(); }) ;
    }
  }
}

ko.bindingHandlers.showRightIn = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) {
      $(element).show();
      $(element).css("left", "100%");
      $(element).animate({ left: '0%',}, 300, function() {
        if (jQuery(document).height() < jQuery(".messages-container").height()) {
          jQuery(".messages-container").css("height", (jQuery(document).height()-148) + "px");
        }
        jQuery(".messages-container").scrollTop(window.screen.availHeight);
      });
    }
  }
}
ko.bindingHandlers.hideRightOut = {
  init: function(element, valueAccessor) {
    var value = valueAccessor();
    $(element).toggle(value);
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (value) {
      $(element).show();
      $(element).css("left", "0%");
      $(element).animate({ left: '100%',}, 300, function(){ $(this).hide(); });
    }
  }
}