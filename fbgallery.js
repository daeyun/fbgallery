// Generated by CoffeeScript 1.3.3

/*
Facebook Page Gallery 1.0
Author: Daeyun Shin
http://shin.ws/
August 17, 2012
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $(function() {
    var Album, AlbumView, Gallery, GalleryRouter, GalleryView, app, centerImg, getAlbums, getCachedHTML, getGalleryInfo, getPhotos, isOutdated, storeHTML, storeJSON;
    app = {};
    app.views = {};
    centerImg = function() {
      var height, width;
      width = $(this).width();
      height = $(this).height();
      return $(this).css({
        left: (200 - width) / 2,
        top: (200 - height) / 2
      });
    };
    getPhotos = function(albumID, thumbnailSize, num, returnTitle) {
      var returnValue, sizes;
      if (thumbnailSize == null) {
        thumbnailSize = "picture";
      }
      if (num == null) {
        num = 0;
      }
      if (returnTitle == null) {
        returnTitle = false;
      }
      returnValue = null;
      sizes = {
        'small': 6,
        'medium': 4,
        'large': 2
      };
      $.ajax({
        url: "https://graph.facebook.com/" + albumID + "/photos?limit=0",
        async: false,
        dataType: 'json',
        cache: true
      }).done(function(data) {
        var i, sizeIndex, x;
        return returnValue = (function() {
          var _i, _j, _len, _len1, _ref, _ref1, _results, _results1;
          if (thumbnailSize === "picture") {
            _ref = data['data'];
            _results = [];
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              x = _ref[i];
              if (num === 0 || i < num) {
                _results.push({
                  thumbnail: x[thumbnailSize],
                  source: x['source']
                });
              }
            }
            return _results;
          } else {
            sizeIndex = sizes[thumbnailSize];
            _ref1 = data['data'];
            _results1 = [];
            for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
              x = _ref1[i];
              if (num === 0 || i < num) {
                _results1.push({
                  thumbnail: x["images"][sizeIndex]['source'],
                  source: x['source']
                });
              }
            }
            return _results1;
          }
        })();
      });
      return returnValue;
    };
    getAlbums = function(pageID) {
      var returnValue;
      returnValue = null;
      $.ajax({
        url: "https://graph.facebook.com/" + pageID + "/albums",
        async: false,
        dataType: 'json',
        cache: true
      }).done(function(data) {
        var x;
        return returnValue = (function() {
          var _i, _len, _ref, _results;
          _ref = data['data'];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            if (x['type'] !== 'profile' && x['name'] !== 'Cover Photos' && "count" in x) {
              _results.push(x);
            }
          }
          return _results;
        })();
      });
      return returnValue;
    };
    getGalleryInfo = function() {
      return $.ajax({
        url: "sqlite.php",
        async: false,
        dataType: "json",
        cache: true,
        type: "POST",
        data: {
          request: "gallery_info"
        }
      }).done(function(data) {
        return data;
      });
    };
    getCachedHTML = function(name) {
      var returnValue;
      returnValue = null;
      $.ajax({
        url: "sqlite.php",
        async: false,
        dataType: "html",
        cache: true,
        type: "POST",
        data: {
          request: "getHTML",
          id: name
        }
      }).complete(function(data) {
        return returnValue = data["responseText"];
      });
      return returnValue;
    };
    storeHTML = function(name, html) {
      return $.ajax({
        url: "sqlite.php",
        dataType: "html",
        cache: true,
        type: "POST",
        data: {
          request: "storeHTML",
          id: name,
          content: html
        }
      });
    };
    storeJSON = function(name, html) {
      return $.ajax({
        url: "sqlite.php",
        dataType: "html",
        cache: true,
        type: "POST",
        data: {
          request: "storeHTML",
          id: name,
          content: html
        }
      });
    };
    Album = (function(_super) {

      __extends(Album, _super);

      function Album() {
        return Album.__super__.constructor.apply(this, arguments);
      }

      return Album;

    })(Backbone.Model);
    Gallery = (function(_super) {

      __extends(Gallery, _super);

      function Gallery() {
        return Gallery.__super__.constructor.apply(this, arguments);
      }

      Gallery.prototype.model = Album;

      return Gallery;

    })(Backbone.Collection);
    AlbumView = (function(_super) {

      __extends(AlbumView, _super);

      function AlbumView() {
        return AlbumView.__super__.constructor.apply(this, arguments);
      }

      AlbumView.prototype.tagName = "li";

      AlbumView.prototype.initialize = function() {
        return _.bindAll(this);
      };

      AlbumView.prototype.render = function() {
        var url, _i, _j, _len, _len1, _ref, _ref1;
        if (app.views.type === 'all_albums') {
          $(this.el).html("<div class=\"background\"></div><div class=\"meta\"><h3>" + (this.model.get('name')) + "</h3><span>" + (this.model.get('description').substring(0, 35)) + "</span></div>\n<a href=\"#\!/" + (this.model.get('id')) + "\" class=\"" + (this.model.get('id')) + "\" title=\"" + (this.model.get('name')) + "\"><ul></ul></a>");
          _ref = this.model.get('photos');
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            url = _ref[_i];
            $(this.el).find("ul").append("<li><div><div><img src=\"" + url['thumbnail'] + "\" alt=\"\" /></div></div></li>");
          }
        } else if (app.views.type === 'single') {
          $(this.el).html("<div><h3>" + (this.model.get('name')) + "</h3><span>" + (this.model.get('description')) + "</span></div>\n<ul></ul>");
          _ref1 = this.model.get('photos');
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            url = _ref1[_j];
            $(this.el).find("ul").append("<li><a href=\"" + url['source'] + "\"><div><div><img src=\"" + url['thumbnail'] + "\" alt=\"\" /></div></div></a></li>");
          }
        }
        return this;
      };

      return AlbumView;

    })(Backbone.View);
    GalleryView = (function(_super) {

      __extends(GalleryView, _super);

      function GalleryView() {
        return GalleryView.__super__.constructor.apply(this, arguments);
      }

      GalleryView.prototype.el = $('#fb_page_gallery');

      GalleryView.prototype.type = 'all_albums';

      GalleryView.prototype.initialize = function() {
        _.bindAll(this);
        this.gallery = new Gallery;
        return this.gallery.bind('add', this.addAlbum);
      };

      GalleryView.prototype.render = function(html) {
        if (html == null) {
          html = "";
        }
        return $(this.el).html("<ul class='fbgallery " + this.type + "'>" + html + "</ul>");
      };

      GalleryView.prototype.addAlbum = function(album) {
        var album_model, album_view, photos;
        photos = getPhotos(album.get(['id']), 'medium', (this.type === "all_albums" ? 4 : 0), true);
        if (photos.length > 0) {
          album_model = new Album({
            name: album.get(['name']),
            id: album.get(['id']),
            description: album.has('description') ? album.get(['description']) : '',
            photos: photos
          });
          album_view = new AlbumView({
            model: album_model
          });
          $(this.el).find("ul.fbgallery").append(album_view.render().el);
          return $("#fb_page_gallery div img").load(centerImg);
        }
      };

      return GalleryView;

    })(Backbone.View);
    isOutdated = function(albums) {
      var album, info, latest, updated_time, _i, _len;
      info = getGalleryInfo();
      if (!("count" in info) || info["count"] === "") {
        return true;
      }
      latest = 0;
      for (_i = 0, _len = albums.length; _i < _len; _i++) {
        album = albums[_i];
        updated_time = new Date(album["updated_time"]);
        if (latest < updated_time) {
          latest = updated_time;
          if (latest > new Date(info["updated"])) {
            return true;
          }
        }
      }
      return false;
    };
    GalleryRouter = (function(_super) {

      __extends(GalleryRouter, _super);

      function GalleryRouter() {
        return GalleryRouter.__super__.constructor.apply(this, arguments);
      }

      GalleryRouter.prototype.routes = {
        "": "home",
        "!/:name": "showAlbum"
      };

      GalleryRouter.prototype.home = function() {
        var album, albums, _i, _len;
        app.views = new GalleryView();
        albums = getAlbums($(app.views.el).attr('class'));
        if (!isOutdated()) {
          window.main = true;
          app.views.render();
          for (_i = 0, _len = albums.length; _i < _len; _i++) {
            album = albums[_i];
            app.views.gallery.add(album);
          }
          return storeHTML("main", unescape($("ul.fbgallery").html()));
        } else {
          return app.views.render(getCachedHTML("main"));
        }
      };

      GalleryRouter.prototype.showAlbum = function(name) {
        app.views = new GalleryView();
        app.views.type = 'single';
        app.views.render();
        window.main = false;
        app.views.gallery.add({
          id: name,
          name: "",
          description: ""
        });
        return $("ul.single a").click(function(e) {
          var currentLink;
          e.preventDefault();
          $("#displayPhoto").remove();
          $("body").append("<div id='popupBackground'></div>");
          $("body").append("<div id='displayPhoto'><span></span><img src=\"" + ($(this).attr('href')) + "\" /></div>");
          currentLink = $(this);
          $('#displayPhoto img').css("width", $(this).width() < 1000 ? $(this.width) : 1000 + "px");
          $("#displayPhoto img").load(function() {
            $('#displayPhoto').show();
            $('#displayPhoto').css("left", ($(window).width() / 2 - $('#displayPhoto').width() / 2) + "px");
            $('#displayPhoto').css("top", ($(window).height() / 2 - $('#displayPhoto').height() / 2) + "px");
            return $("#displayPhoto span").html("" + ($('.single a').index(currentLink) + 1) + "/" + ($('.single a').size()));
          });
          $("#popupBackground").click(function(e) {
            e.preventDefault();
            $("#displayPhoto").remove();
            return $("#popupBackground").remove();
          });
          return $("#displayPhoto img").click(function(e) {
            e.preventDefault();
            currentLink = currentLink.parent().next().find("a");
            if (currentLink.length === 0) {
              currentLink = $(".single ul li:first-child a");
            }
            return $(this).attr("src", currentLink.attr("href"));
          });
        });
      };

      return GalleryRouter;

    })(Backbone.Router);
    app.views = new GalleryView();
    app.router = new GalleryRouter();
    Backbone.history.start();
    $("#fb_page_gallery li").mouseover(function() {
      return $(this).stop().fadeTo(100, 0.8);
    }).mouseout(function() {
      return $(this).stop().fadeTo(100, 1);
    });
    return $("#fb_page_gallery li a").click(function(x) {
      var link;
      x.preventDefault();
      link = $(this);
      $("#fb_page_gallery li a").unbind('mouseover');
      $("#fb_page_gallery li a").unbind('mouseout');
      return $(this).parent().siblings().fadeTo(230, 0, function() {
        return Backbone.history.navigate(link.attr("href"), true);
      });
    });
  });

}).call(this);
