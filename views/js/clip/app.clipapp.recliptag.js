App.ClipApp.ReclipTag = (function(App, Backbone, $){
  var ReclipTag = {};
  var defaultNote = "备注一下吧~";
  var P = App.ClipApp.Url.base;

  var ReclipTagModel = App.Model.extend({
    url: function(){
      return P+"/user/"+this.id+"/reclip/tag/"+this.get("tag");
    }
  });

  var ReclipTagView = App.ItemView.extend({
    tagName : "div",
    className : "reclipTag-view",
    template : "#reclipTag-view-template",
    events : {
      "focus #reclip_text" : "foucsAction",
      "blur #reclip_text"  : "blurAction",
      "click #submit"      : "submit",
      "click #cancel"      : "cancel",
      "click .size48"      : "maintagAction",
      "click .close_w"     : "cancel"
    },
    maintagAction:function(e){
      $(e.currentTarget).toggleClass("white_48");
      $(e.currentTarget).toggleClass("orange_48");
    },

    foucsAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == defaultNote ? "" :
      $(e.currentTarget).val() );
    },

    blurAction:function(e){
      $(e.currentTarget).val( $(e.currentTarget).val() == "" ? defaultNote :
      $(e.currentTarget).val() );
    },
    submit:function(evt){
      evt.preventDefault();
      var params = loadData(this.$el);
      params["id"] = this.model.get("user");
      params["tag"] = this.model.get("tag");
      App.vent.trigger("app.clipapp.reclip_tag:@submit", params);
    },
    cancel : function(e){
      e.preventDefault();
      App.vent.trigger("app.clipapp.reclip_tag:@close");
    }
  });


  function loadData(el){
    var text = "";
    if($("#reclip_text", el).val().trim()!=defaultNote){//过滤defaultNote默认值
      text = $("#reclip_text", el).val().trim();
    }
    var main_tag = [];
    for(var i=0;i<6;i++){
      if($("#main_tag_"+i,el).attr("class") == "size48 orange_48"){
	main_tag.push($("#main_tag_"+i,el).html().trim());
      }
    };
    var tag = _.without($("#obj_tag",el).val().split(","),"");
    tag = _.union(tag, main_tag);
    if($("#checkbox",el).attr("checked")){
      var params = {clip:{note: [{text:text}],tag:tag,"public":"false"}};
    }else{
      var params = {clip:{note: [{text:text}],tag:tag}};
    }
    return params;
  }

  ReclipTag.show = function(user, tag){
    var model = new ReclipTagModel(); //此model只用于取数据
    model.fetch({
      type: "GET",
      url: P+"/user/"+user+"/clip/tag/"+tag,
      success: function(model, res){
	if(res.count == null){
	  // 现在只是公用该事件，事件名称有待改进
	  App.vent.trigger("app.clipapp.message:confirm","reclip_null");
	}else{
	  // 有count表示可以收到数据
	  model.set({user:user,tag:tag});
	  var view = new ReclipTagView({model : model});
	  App.popRegion.show(view);
	  $('#obj_tag').tagsInput({
	    //autocomplete_url:'test/fake_json_endpoint.html'
	  });
	}
      },
      error:function(model, res){
	  console.info(res);
      }
    });
  };

  ReclipTag.close = function(){
    App.popRegion.close();
  };

  App.vent.bind("app.clipapp.reclip_tag:@submit", function(params){
    var model = new ReclipTagModel(params);
    model.save({}, {
      type: "POST",
      success: function(model, res){
	ReclipTag.close();
      },
      error:function(model, res){
	console.info(res);
      }
    });
  });

  App.vent.bind("app.clipapp.reclip_tag:@close",function(){
    ReclipTag.close();
  });

  return ReclipTag;
})(App, Backbone, jQuery);