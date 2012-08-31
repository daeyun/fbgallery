###
Facebook Page Gallery 1.0
Author: Daeyun Shin
http://shin.ws/
August 17, 2012
###

$ ->

    app={}
    app.views={}

    centerImg = () ->
        width=$(@).width()
        height=$(@).height()
        $(@).css(
            left:(200-width)/2
            top:(200-height)/2
        )

    getPhotos = (albumID,thumbnailSize="picture",num=0,returnTitle=false) ->
        # fetch all photos by default (num=0)
        returnValue = null
        sizes =
            'small':6
            'medium':4
            'large':2
        $.ajax
            url:"https://graph.facebook.com/#{albumID}/photos?limit=0"
            async:false
            dataType:'json'
            cache:true
        .done (data) ->
            returnValue =
                if thumbnailSize is "picture"
                    for x,i in data['data'] when num==0 or i<num
                        thumbnail:x[thumbnailSize]
                        source:x['source']
                else
                    sizeIndex=sizes[thumbnailSize]
                    for x,i in data['data'] when num==0 or i<num
                        thumbnail:x["images"][sizeIndex]['source']
                        source:x['source']
        returnValue

    getAlbums = (pageID) ->
        returnValue = null
        $.ajax
            url:"https://graph.facebook.com/#{pageID}/albums"
            async:false
            dataType:'json'
            cache:true
        .done (data) ->
            returnValue =
                x for x in data['data'] when x['type'] isnt 'profile' and x['name'] isnt 'Cover Photos' and "count" of x
                # "count" doesn't exist if the album is empty
        returnValue

    getGalleryInfo = ->
        $.ajax
            url:"sqlite.php"
            async:false
            dataType:"json"
            cache:true
            type:"POST"
            data:{request:"gallery_info"}
        .done (data) ->
            data

    getCachedHTML = (name) ->
        returnValue = null
        $.ajax
            url:"sqlite.php"
            async:false
            dataType:"html"
            cache:true
            type:"POST"
            data:{request:"getHTML",id:name}
        .complete (data) ->
            returnValue = data["responseText"]
        returnValue

    storeHTML = (name,html) ->
        $.ajax
            url:"sqlite.php"
            dataType:"html"
            cache:true
            type:"POST"
            data:{request:"storeHTML",id:name,content:html}


    storeJSON = (name,html) ->
        $.ajax
            url:"sqlite.php"
            dataType:"html"
            cache:true
            type:"POST"
            data:{request:"storeHTML",id:name,content:html}


    class Album extends Backbone.Model

    class Gallery extends Backbone.Collection
        model: Album

    class AlbumView extends Backbone.View
        tagName: "li" #used to create @el
        initialize: ->
            _.bindAll @
        render: ->
            if app.views.type is 'all_albums'
                $(@el).html """
                    <div class="background"></div><div class="meta"><h3>#{@model.get 'name'}</h3><span>#{@model.get('description').substring(0,35)}</span></div>
                    <a href="#\!/#{@model.get 'id'}" class="#{@model.get 'id'}" title="#{@model.get 'name'}"><ul></ul></a>
                    """
                for url in @model.get 'photos'
                    $(@el).find("ul").append """
                        <li><div><div><img src="#{url['thumbnail']}" alt="" /></div></div></li>
                        """
            else if app.views.type is 'single'
                $(@el).html """
                    <div><h3>#{@model.get 'name'}</h3><span>#{@model.get 'description'}</span></div>
                    <ul></ul>
                    """
                for url in @model.get 'photos'
                    $(@el).find("ul").append """
                        <li><a href="#{url['source']}"><div><div><img src="#{url['thumbnail']}" alt="" /></div></div></a></li>
                        """
            @

    class GalleryView extends Backbone.View
        el: $ '#fb_page_gallery'
        type: 'all_albums'
        initialize: ->
            _.bindAll @

            @gallery = new Gallery
            @gallery.bind 'add', @addAlbum

        render: (html="") ->
            $(@el).html "<ul class='fbgallery #{@type}'>#{html}</ul>"
        addAlbum: (album) ->
            photos = getPhotos (album.get ['id']), 'medium', (if @type=="all_albums" then 4 else 0), true
            if photos.length >0
                album_model = new Album
                    name:album.get ['name']
                    id:album.get ['id']
                    description:if album.has 'description' then album.get ['description'] else ''
                    photos:photos
                album_view = new AlbumView model: album_model
                $(@el).find("ul.fbgallery").append album_view.render().el

                $("#fb_page_gallery div img").load centerImg


    isOutdated = (albums) ->
        info = getGalleryInfo()
        if "count" not of info or info["count"] == ""
            #empty or doesn't exist
            return true

        latest = 0
        for album in albums
            updated_time = new Date album["updated_time"]
            if latest < updated_time
                latest = updated_time
                if latest > new Date info["updated"]
                    return true
        false

    class GalleryRouter extends Backbone.Router
        routes:
            "":"home"
            "!/:name":"showAlbum"
        home: ->
            app.views = new GalleryView()
            albums = getAlbums $(app.views.el).attr 'class'
            
            if !isOutdated()
                window.main=true
                app.views.render()
                for album in albums
                    app.views.gallery.add album
                storeHTML "main", unescape $("ul.fbgallery").html()
                # exclamation marks in the urls are escaped so they need to be stored unescaped
            else
                app.views.render getCachedHTML "main"

        showAlbum: (name) ->
            app.views = new GalleryView()
            app.views.type = 'single'
            app.views.render()
            window.main=false
            app.views.gallery.add {id:name,name:"",description:""}

            $("ul.single a").click (e) ->
                e.preventDefault()
                $("#displayPhoto").remove()
                $("body").append("<div id='popupBackground'></div>")
                $("body").append("<div id='displayPhoto'><span></span><img src=\"#{$(this).attr('href')}\" /></div>")

                currentLink=$(this)

                $('#displayPhoto img').css("width", if($(this).width()<1000) then $(this.width) else 1000 + "px")

                $("#displayPhoto img").load ->
                    $('#displayPhoto').show()
                    $('#displayPhoto').css("left", ($(window).width()/2-$('#displayPhoto').width()/2) + "px")
                    $('#displayPhoto').css("top", ($(window).height()/2-$('#displayPhoto').height()/2) + "px")
                    $("#displayPhoto span").html "#{$('.single a').index(currentLink)+1}/#{$('.single a').size()}"

                $("#popupBackground").click (e) ->
                    e.preventDefault()
                    $("#displayPhoto").remove()
                    $("#popupBackground").remove()

                $("#displayPhoto img").click (e) ->
                    e.preventDefault()
                    currentLink = currentLink.parent().next().find("a")
                    if currentLink.length == 0
                        currentLink = $(".single ul li:first-child a")

                    $(this).attr("src",currentLink.attr("href"))

    app.views = new GalleryView()

    app.router = new GalleryRouter()
    Backbone.history.start()
    
    $("#fb_page_gallery li").mouseover ->
        $(@).stop().fadeTo(100,0.8)
    .mouseout ->
        $(@).stop().fadeTo(100,1)

    $("#fb_page_gallery li a").click (x) ->
        x.preventDefault()
        link=$(@)
        $("#fb_page_gallery li a").unbind('mouseover')
        $("#fb_page_gallery li a").unbind('mouseout')
        $(@).parent().siblings().fadeTo 230,0, ->
            Backbone.history.navigate(link.attr("href"),true)


