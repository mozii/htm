App.ClipApp.ClipAdd = (function(App, Backbone, $){
  var ClipAdd = {};
  var P = App.ClipApp.Url.base;

  var ImgModel = App.Model.extend({});
  var LocalImgView = App.ItemView.extend({
    tagName: "form",
    className: "localImg-view",
    template: "#localImg-view-template"
  });

  var ClipModel = App.Model.extend({
    url: function(){
      return P+"/clip";
    }
  });

  var AddClipView = App.ItemView.extend({
    tagName: "div",
    className: "addClip-view",
    template: "#addClip-view-template",
    events: {
      "click #exImg":"extImg",
      "click #localImg":"localImg",
      "click #save":"save",
      "click #abandon":"abandon",
      "click #insText": "addText",
      "click .detail-text":"editText"
    },
    extImg:function(evt){
      var url = prompt("url","http://");
      if(url == "http://" || url == null)
	return;
      var img = $("<img class='detail-image' src= "+url+">");
      // contentContainer.append(img);
      $(".addClip-container").append(img);
    },
    addText: function(){
      var newText = $("<p class='detail-text'>新内容</p>");
      $(".addClip-container").append(newText);
      $("#text").focus();
    },
    localImg:function(){
      var user = this.model.get("id");
      var url =	P+"/user/" + user + "/image";
      console.log(url);
      var imgModel = new ImgModel();
      imgModel.set("actUrl",url);
      var localImgView = new LocalImgView({
	model: imgModel
      });
      ClipAdd.LocalImgRegion = new App.RegionManager({el: "#imgUploadDiv"});
      if($("#imgUploadDiv").html() == ""){
	ClipAdd.LocalImgRegion.show(localImgView);
	$("#post_frame").load(function(){ // 加载图片
	  var returnVal = this.contentDocument.documentElement.textContent;
	  console.log(returnVal);
	  if(returnVal != null && returnVal != ""){
	    var returnObj = eval(returnVal);
	    if(returnObj[0] == 0){
	      var imgids = returnObj[1];
	      for(var i=0;i<imgids.length;i++){
		var url = P+"/user/"+ user+"/image/" +imgids[i];
		var img = $("<img class='detail-image' src= "+url+">");
		$(".addClip-container").append(img);

	      }
	    }
	  }
	});
      }else{
	$("#imgUploadDiv").empty();
	// ClipEdit.LocalImgRegion.close();
      }
    },
    editText:function(evt){
      var contentText = $(evt.target);
      contentText.attr("contenteditable",false);
      var text = contentText.text().replace(/(^\s*)|(\s*$)/g,"");
      var h = contentText.height()*1.1;
      var w = contentText.width();
      contentText.empty();

      var textarea = $(document.createElement("textarea"));
      // console.info(text);
      textarea.val(text);
      textarea.width(w);
      textarea.height(h);
      contentText.append(textarea);
      textarea.focus();

      textarea.blur(function(evt){
	// console.info(text);
	var text = textarea.val().replace(/(^\s*)|(\s*$)/g,"");
	textarea.remove();
	contentText.text(text);
      }).click(function(evt){
	evt.stopPropagation();
	evt.preventDefault();
      });
    },
    save: function(){
      var _data = {content : []};
      var user = this.model.get("id");
      $(".addClip-container").children().each(function(){
	var _text = $(this).text() ? $(this).text().replace(/(^\s*)|(\s*$)/g,"") : "";
	var src = this.src;
	if(_text == "" && !src){
	  $(this).remove();
	}
	if(_text){ // && text.replace(/(^\s*)|(\s*$)/g,"") != ""){
	  _data.content.push({text:_text});//.replace(/(^\s*)|(\s*$)/g,"") );
	}else if(src){ //如果有图片
	  var prefix = P + "/user/"+user+"/image/";
	  if(src.indexOf(prefix) != -1){
	    id = src.split(prefix);
	    src = id[1];
	  }
	  _data.content.push({image:src});
	}
      });
      console.log(_data);
      this.model.save(_data,{
	url: P+"/clip",
	type: 'POST',
	success:function(response){
	  var cid = user+":";
	  // 临时处理
	  for(var i in response.toJSON()){
	    if(i != "content" && i!= "id")
	      cid += i;
	  }
	  App.vent.trigger("app.clipapp:clipdetail", cid);
	},
	error:function(response){
	  // 出现错误，触发统一事件
	  App.vent.trigger("app.clipapp.clipadd:error");
	}
      });
    },
    abandon: function(){
      // 直接返回详情页面
      App.vent.trigger("app.clipapp.clipadd:cancel");
    }
  });

  ClipAdd.show = function(uid){
    var clipModel = new ClipModel({id: uid});
    var addClipView = new AddClipView({model: clipModel});
    App.viewRegion.show(addClipView);
  };

  App.vent.bind("app.clipapp.clipadd:cancel", function(){
    App.viewRegion.close();
  });

  App.vent.bind("app.clipapp.clipadd:error", function(){
    console.info("addClip error");
  });

  return ClipAdd;

})(App, Backbone, jQuery);