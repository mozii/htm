App.ClipApp.Bubb = (function(App, Backbone, $){
  var Bubb = {};
  var P = App.ClipApp.Url.base;
  // model && view

  var BubbModel = App.Model.extend({
    parse: function(resp){
      return resp;
    }
  });

  var BubbView = App.ItemView.extend({
    id : "bubbles",
    tagName : "iframe",
    className : "bubb-view",
    render : function(){
      this.$el.attr("src", "bub.html");
      return this;
    }
  });

  // constants

  var bubs = ["好玩", "好听", "好看", "好吃", "好用", "弓虽"];
  //var bubs = ["好玩", "好听", "好看", "好吃", "酷", "精辟"];
  var sink = ["讨厌"];
  Bubb.myObjTag = [];
  // private
  var _uid  = null;
  var last = null;
  var old_self = null;
  var self = true;

  // exports

  Bubb.showSiteTags = function(tag){
    _uid = null;
    self = false;
    getSiteTags(function(tags, follows){
      App.vent.trigger("app.clipapp.bubb:@show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.showSiteBubs = function(tag){
    _uid = null;
    self = false;
    getSiteBubs(function(tags, follows){
      App.vent.trigger("app.clipapp.bubb:@show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.showUserTags = function(uid, tag){
    _uid = uid;
    self = false;
    var token = document.cookie.split("=")[1];
    getUserTags(uid, function(tags, follows){
      if(token && token.split(":")[0] == uid){
	self = true;
      }
      App.vent.trigger("app.clipapp.bubb:@show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.showUserBubs = function(uid, tag){
    _uid = uid;
    self = false;
    var token = document.cookie.split("=")[1];
    getUserBubs(uid, function(tags, follows){
      if(token && token.split(":")[0] == uid)
	self = true;
      App.vent.trigger("app.clipapp.bubb:@show", mkTag(tags, follows, tag, self));
    });
  };

  Bubb.followUsreBubs = function(uid, tag){
    if(!uid) _uid = 2;
    followUserTag(uid, tag, function(){
      // 更新bubb显示
      iframe_call('bubbles', "followTag", tag);
      App.vent.trigger("app.clipapp.followerlist:refresh"); //刷新右边follower列表
      if(last && last.follows){
	if(_.isEmpty(last.follows)){
	  App.vent.trigger("app.clipapp.face:show",_uid);
	}
	last.follows.push(tag);
      }
    });
  };

  // events

  App.vent.bind("app.clipapp.bubb:@show", function(tags){
    if($('#bubbles').length == 0){
      var bubbView = new BubbView();
      App.bubbRegion.show(bubbView);
    }
    if (changeTags(last, tags, old_self, self)) {
      iframe_call('bubbles', "resetTags", tags);
    } else if (changeDefault(last, tags)) {
      iframe_call('bubbles', "openTag", tags.current);
    }
    old_self = self;
    last = tags;
  });

  App.vent.bind("app.clipapp.bubb:refresh",function(uid,follow,new_tags){
    _uid = uid;
    self = false;
    if(App.util.getMyUid() == uid) self = true;
    if(follow){
      App.vent.trigger("app.clipapp.bubb:@show", mkTag(last.tags, follow, null, self));
    }else if(new_tags){
      App.vent.trigger("app.clipapp.bubb:@show", mkTag(_.union(last.tags,new_tags), follow, null, self));
    }
  });

  App.vent.bind("app.clipapp.bubb:open", function(tag){
    // console.log("open %s", tag + "  " +_uid);
    // 更新bubb显示
    iframe_call('bubbles', "openTag", tag);
    //设为false也可直接刷新 但是提交上去的数据是乱码
    var url = mkUrl(tag);
    Backbone.history.navigate(url, false);
    App.vent.trigger("app.clipapp:cliplist.refresh", _uid, url, tag);
  });

  // 因为当前用户是否登录，对follow有影响 所以触发app.clipapp.js中绑定的事件
  App.vent.bind("app.clipapp.bubb:follow", function(tag){
    App.vent.trigger("app.clipapp:follow", _uid, tag);
  });

  App.vent.bind("app.clipapp.bubb:unfollow", function(tag, uid){
    unfollowUserTag(uid, tag, function(){
      // 更新bubb显示
      iframe_call('bubbles', "unfollowTag", tag);
      App.vent.trigger("app.clipapp.followerlist:refresh"); // 刷新右边follower列表
      // 若之后已停，则需刷新头像为追
      if(last && last.follows){
	last.follows = _.without(last.follows,tag);
	if(_.isEmpty(last.follows)){
	  App.vent.trigger("app.clipapp.face:show",_uid);
	}
      }
    });
  });

  // 有_uid作为全局变量，进行url地址匹配
  App.vent.bind("app.clipapp.bubb:reclip", function(tag){
    App.vent.trigger("app.clipapp:reclip_tag",  _uid, tag);
  });

  // init
  App.vent.bind("app.clipapp.bubb:showUserTags", function(uid){
    Bubb.showUserTags(uid);
  });

  App.addInitializer(function(){
  });

  // ---- implements

  // service api

  function getSiteTags(callback){
    // API getSiteTags
    // CHANGE 需按当前用户查找各 tag 的 follow 关系
    // GET $HOST/$BASE/_/user/0/meta/0..19
    // var follows = ["动漫", "科技"];
    // var tags = ["电影", "音乐", "美女", "穿越", "户外", "流行"];
    var bubbModel = new BubbModel({id: "2"});
    var url = P+"/user/"+bubbModel.id+"/meta/0..19";
    bubbModel.fetch({url: url});
    bubbModel.onChange(function(bubbs){
      var bubb = bubbs.toJSON();
      callback(bubb.tag, bubb.follow);
    });
  }

  function getSiteBubs(callback){
    getSiteTags(function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }

  // 取 uid 的 tag
  Bubb._getUserTags = getUserTags;
  function getUserTags(uid, callback){
    // API getUserTags
    // CHANGE 需按当前用户查找各 tag 的 follow 关系
    // GET $HOST/$BASE/_/user/:id/tag/0..19
    var bubbModel = new BubbModel({id: uid});
    var url = P+"/user/"+uid+"/meta/0..19";
    bubbModel.fetch({url: url});
    bubbModel.onChange(function(bubbs){
      var bubb = bubbs.toJSON();
      if(uid == App.util.getMyUid()){
	Bubb.myObjTag  = _.difference( bubb.tag,App.util.getBubbs());
      }
      callback(bubb.tag, bubb.follow);
    });
  }

  function getUserBubs(uid, callback){
    getUserTags(uid, function(tags, follows){
      var tags2 = _.intersection(tags, bubs);
      var follows2 = _.intersection(follows, bubs);
      callback(tags2, follows2);
    });
  }

  function followUserTag(uid, tag, callback){
    if(!uid) uid = _uid;
    var url = url = P+"/user/"+uid+"/follow";
    if(tag == '*') {
      tag = "all";
    }else{
      tag = [tag];
    }
    var bubbModel = new BubbModel();
    bubbModel.save({tag: tag}, {
      url: url,
      data: JSON.stringify({tag: tag}),
      contentType:"application/json; charset=utf-8",
      success:callback,
      error:function(model, error){
	App.vent.trigger("app.clipapp.message:chinese", error);
      }
    });
  }

  function unfollowUserTag(uid, tag, callback){
    var url = "";
    if(!uid){
      uid = _uid ? _uid : 2;
    }
    if(tag == '*') {
      url = P+"/user/"+uid+"/follow";
    }else{
      url  = P+"/user/"+uid+"/follow/"+tag;
    }
    var bubbModel = new BubbModel({id: uid});
    bubbModel.destroy({
      url: url,
      success:callback,
      error:function(){}
    });
  }

  // call functions inside iframe

  function iframe_call(ifname, fname, fargs){
    var _iframe =  document.getElementById(ifname);
    var ifwin = _iframe.contentDocument.parentWindow ? _iframe.contentDocument.parentWindow :_iframe.contentDocument.defaultView;
    if(ifwin && ifwin[fname]){
      //console.info(ifwin);
      //console.log(ifwin[fname]);
      //console.log("iframe_call(", ifname, fname, fargs, ")");
      //console.log(typeof fargs.bubs);
      //console.dir(fargs);
      ifwin[fname](fargs);
    }else { // waiting for iframe load
      // console.info("waiting for iframe reload");
      setTimeout(function(){ iframe_call(ifname, fname, fargs); }, 100);
    }
  }

  // utils 因为追了所有没有办法只停追一个
  function mkTag(tags, followss, tag, self){
    // DEBUG PURPOSE
    var follows = _.without(followss,'*');
    tags = _.union(bubs, sink, tags, follows);
    var opt = {
      tags: tags,
      follows: follows,
      bubs: _.intersection(bubs, tags),
      sink: _.intersection(sink, tags),
      self: self
    };
    if(tag) opt.current = tag;
    return opt;
  }

  // 需要区分 my/interest、 my/recommend、和 my
  function mkUrl(tag){
    var url = Backbone.history.fragment;
    var i = url.indexOf("/tag");
    if(_uid){
      if(i >= 0){
	url = url.substr(0, i);
	return url += "/tag/"+tag;
      }else{
	if(url.indexOf("my/interest") >= 0)
	  return "/my/interest/tag/"+tag;
	else if(url.indexOf("my/recommend") >= 0)
	  return "/my/recommend/tag/"+tag;
	else if(url.indexOf("my") >= 0)
	  return "/my/tag/"+tag;
	else
	  return "/user/"+_uid+"/tag/"+tag;
      }
    }else{
      return "/tag/"+tag;
    }
  };

  function changeTags(tags1, tags2, old_self, self){
    if(old_self != self){
      // 若 self 已经变化，则 tag 不能重用
      return true;
    }
    if(_.isEmpty(tags2.follows)){
      // 若 follows 为空，意味着追（[*]被过滤为[]）或停（[]），则 tag 不能重用
      return true;
    }
    if(tags1 && tags1.tags && tags2 && tags2.tags){
      // 若 tag1 和 tag2 的 tags 没有不同，则可以重用
      return _.difference(tags1.tags, tags2.tags).length != 0;
    } else {
      // 否则，不能重用
      return true;
    }
  }

  function changeDefault(tags1, tags2){
    if(tags1 && tags1.current && tags2 && tags2.current){
      return tags1.current != tags2.current;
    } else {
      return true;
    }
  }

  // return

  return Bubb;
})(App, Backbone, jQuery);