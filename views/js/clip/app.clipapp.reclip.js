App.ClipApp.Reclip = (function(App, Backbone, $){
  var Reclip = {};
  var P = App.ClipApp.Url.base;
  var mid,o_pub;

  var ReclipModel = App.Model.extend({
    url: function(){
      var uid = this.get("id").split(":")[0];
      var cid = this.get("id").split(":")[1];
      return App.ClipApp.encodeURI(P+"/"+uid + "/" + cid+"/reclip");
    }
  });
  var ReclipView = App.DialogView.extend({
    tagName : "div",
    className : "reclip-view",
    template : "#reclip-view-template",
    events : {
      //"keydown #reclip_text":"shortcut_submit",
      //"focus #reclip_text" : "foucsAction",
      //"blur #reclip_text"  : "blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      : "maintagAction",
      "click .masker"      : "masker",
      "click .close_w"     : "cancel"
    },
    initialize: function(){
      this.bind("@submit", reclipSave);
      this.bind("@closeView", close);
    },
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },
    /*
    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == _i18n('reclip.defaultNote')  ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? _i18n('reclip.defaultNote') :
      $(e.currentTarget).val() );
    },
    */
    submit:function(e){
      e.preventDefault();
      $(e.currentTarget).attr("disabled",true);
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
      params["id"] = this.model.id;
      if($(".error").length == 0){
	this.trigger("@submit", params, mid);
      }else{
	$(e.currentTarget).attr("disabled",false);
      }
    },
    shortcut_submit : function(e){
      if(e.ctrlKey&&e.keyCode==13){
	$("#submit").click();
	return false;
      }else{
	return true;
      }
    },
    masker: function(e){
      if($(e.target).attr("class") == "masker"){
	this.cancel(e);
      }
    },
    cancel : function(e){
      e.preventDefault();
      var params = loadData(this.$el);
      params["rid"] = this.model.get("rid");
      params["id"] = this.model.id;
      this.trigger("@closeView",params);
    }
  });

  function loadData(el){
    /*var text = "";
    if($.trim($("#reclip_text", el).val())!=_i18n('reclip.defaultNote')){//过滤defaultNote默认值
      text = $.trim($("#reclip_text", el).val());
    }*/
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($.trim($("#main_tag_"+i,el).html()));
      }
    };
    var obj_tag = _.without($("#obj_tag",el).val().split(","),"");
    obj_tag = _(obj_tag).map(function(e){return e.toLocaleLowerCase();});
    var tag = _.union(obj_tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{tag:tag,"public":"false"}};
    }else{
      var params = {clip:{tag:tag,"public":"true"}};
    }
    return params;
  }

  Reclip.close = function(params){
    if(!params||(params.clip.tag.length==0 && params.clip["public"]==o_pub)){
      App.popRegion.close();
      mid = null;
    }else{
      var fun = function(){ App.popRegion.close(); mid=null; };
      App.ClipApp.showAlert("reclip_save", null, fun);
    }
  };

  var close = Reclip.close;

  function reclipSave(params,mid){
    var model = new ReclipModel(params);
    model.save({},{
      type: "POST",
      success: function(model, res){
	App.ClipApp.showSuccess({reclip:"success"});
	var args = {model_id:mid,tag:params.clip.tag};
	App.vent.trigger("app.clipapp.reclip:success", args);
	Reclip.close();
      },
      error:function(model, res){
	Reclip.close();
	App.ClipApp.showConfirm(res);
      }
    });
  }

  Reclip.show = function(cid,model_id,recommend,pub){
    mid = model_id;
    var rid = recommend.rid;
    var ruser = recommend.user;
    if(pub == "false" && ruser != cid.split(':')[0]){
      // 是没公开的，并且不是clip_owner进行的操作
      App.ClipApp.showConfirm({reclip:"no_pub"});
    }else{
      var model = new ReclipModel({id:cid,rid:rid});
      var reclipView = new ReclipView({model : model});
      App.popRegion.show(reclipView);
      o_pub = pub;
      if(pub == "false") $("#checkbox").attr("checked",true);
      $('#obj_tag').tagsInput({});
    }
  };

/*
  App.vent.bind("app.clipapp.reclip:sync", function(params,mid){
    reclipSave(params,mid);
  });
*/

   // TEST
   // App.bind("initialize:after", function(){ Reclip.show("1:1"); });
  return Reclip;
})(App, Backbone, jQuery);
