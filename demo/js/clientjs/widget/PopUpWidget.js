﻿PopUpWidget = function(_container,_options){
  this.container = _container;
  this.options = _options;
  this.widgetType = "PopUpWidget";
  this.popupContainer = $("#popupContact");
  _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      //this.render();
    },
    render:function(){
      this.centerPopup();
      this.loadPopup();
    },
    events:{
      "click #popupContactClose":"disablePopup",
      "click #backgroundPopup":"disablePopup"
    },
    popupStatus:0,
    loadPopup:function(){
      //loads popup only if it is disabled
      if(this.popupStatus==0){
	$("#backgroundPopup").css("opacity","0.8");
	$("#backgroundPopup").fadeIn("slow");
	$("#popupContact").fadeIn("slow");
	this.popupStatus = 1;
      }
    },
    disablePopup:function(evt){
      //disables popup only if it is enabled
      if(this.popupStatus==1){
	$("#backgroundPopup").fadeOut("slow");
	$("#popupContact").fadeOut("slow");
	this.popupStatus = 0;
      }
    },
    centerPopup:function(){
      //request data for centering
      var windowWidth = _options.clientWidth;
      var windowHeight = _options.clientHeight;
      var popupHeight = _options.contentHeight;
      var popupWidth = _options.contentWidth;
      //centering
      $("#popupContact").css({
	"position": "absolute",
	"top": windowHeight/2-popupHeight/2,
	"left": windowWidth/2-popupWidth/2,
	"width":popupWidth,
	"height":popupHeight
      });      //only need force for IE6
      $("#backgroundPopup").css({
      "height": windowHeight
      });
    },
  })
  this.view = new _view();
  var temp = this.view;
  //bind the client.EVENTS.POPUP_CLOSE
  GlobalEvent.bind(client.EVENTS.POPUP_CLOSE,function(){
    temp.disablePopup();
  });
}
PopUpWidget.prototype.initialize = function(){
  this.view.initialize();
}
PopUpWidget.prototype.terminalize = function(){
  this.parentApp.removeChild(this);
  this.parentApp.popUpWidget = null;
}
PopUpWidget.prototype.render = function(){
  this.view.render();
}
PopUpWidget.prototype.loadWidget = function(widget){
  this.render();
  // widget.render();
}
PopUpWidget.prototype.setPopUpSize = function(options){
  if(options.popupWidth)
    this.popupContainer.css("width",options.popupWidth);
  if(options.popupHeight)
    this.popupContainer.css("height",options.popupHeight);
}
/*
PopUpWidget = function(_container,_options){
  this.container = _container;
  this.options = _options;
  this.widgetType = "PopUpWidget";
  this.popupContainer = $("#popupContact");
  _view = Backbone.View.extend({
    el:$(_container),
    initialize:function(){
      //this.render();
    },
    render:function(){
      this.centerPopup();
      this.loadPopup();
    },
    events:{
      "click #popupContactClose":"disablePopup",
      "click #backgroundPopup":"disablePopup",
      "click #cancel_button":"disablePopup"
    },
    popupStatus:0,
    loadPopup:function(){
      //loads popup only if it is disabled
      if(this.popupStatus==0){
	$("#backgroundPopup").css("opacity","0.8");
	$("#backgroundPopup").fadeIn("slow");
	$("#popupContact").fadeIn("slow");
	this.popupStatus = 1;
      }
    },
    disablePopup:function(evt){
      //disables popup only if it is enabled
      if(this.popupStatus==1){
	$("#backgroundPopup").fadeOut("slow");
	$("#popupContact").fadeOut("slow");
	this.popupStatus = 0;
      }
    },
    centerPopup:function(){
      //request data for centering
      var windowWidth = _options.clientWidth;
      var windowHeight = _options.clientHeight;
      var popupHeight = _options.contentHeight;
      var popupWidth = _options.contentWidth;
      //centering
      $("#popupContact").css({
	"position": "absolute",
	"top": windowHeight/2-popupHeight/2,
	"left": windowWidth/2-popupWidth/2,
	"width":popupWidth,
	"height":popupHeight
      });
      //only need force for IE6
      $("#backgroundPopup").css({
	"height": windowHeight
      });
    },
  })
  this.view = new _view();
  var temp = this.view;
  //bind the client.EVENTS.POPUP_CLOSE
  GlobalEvent.bind(client.EVENTS.POPUP_CLOSE,function(){
    temp.disablePopup();
  });
}
PopUpWidget.prototype.initialize = function(){
  this.view.initialize();
}
PopUpWidget.prototype.terminalize = function(){
  this.parentApp.removeChild(this);
  this.parentApp.popUpWidget = null;
}
PopUpWidget.prototype.render = function(){
    this.view.render();
}
PopUpWidget.prototype.loadWidget = function(widget){
  this.render();
  widget.render();
}
PopUpWidget.prototype.setPopUpSize = function(options){
  if(options.popupWidth)
  this.popupContainer.css("width",options.popupWidth);
  if(options.popupHeight)
  this.popupContainer.css("height",options.popupHeight);
}*/