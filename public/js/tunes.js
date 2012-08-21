Tunes = Ember.Application.create({
  data: [],
  loadData: function(data){
    this.get('data').addObjects(data)
  },
  ready: function(){
    $.ajax({
      url: '/albums.json',
      context: this,
      success: this.loadData
    })
  }
});

Tunes.ApplicationController = Ember.Controller.extend();
Tunes.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

Tunes.PlaybackController = Ember.ObjectController.extend({
  audio: new Audio,
  playlistController: null,
  init: function(){
    this._super();
    this.get('audio').addEventListener('ended', function() { this.audioDidEnd(); }.bind(this));
  },
  togglePlaying: function(){
    this.get('isPlaying') ? this.pause() : this.play();
  },
  audioDidEnd: function(){
    this.get('playlistController').next();
  },
  pause: function(){},
  play:  function(){}
});
Tunes.PlaybackView = Ember.View.extend({
  templateName: 'playback'
});

Tunes.PlaylistController = Ember.ArrayController.extend();
Tunes.PlaylistView = Ember.View.extend({
  templateName: 'playlist'
});

Tunes.LibraryController = Ember.ArrayController.extend();
Tunes.LibraryView = Ember.View.extend({
  templateName: 'library'
});

Tunes.AlbumView = Ember.View.extend({
  templateName: 'album',
  classNames: ["album"],
  classNameBindings: ["isCurrent:current"]
});

Tunes.Router = Em.Router.extend({
  enableLogging: true,
  root: Em.Route.extend({
    index: Em.Route.extend({
      route: '/',
      connectOutlets: function(router) {
        var applicationController = router.get('applicationController');
        applicationController.connectOutlet('playback', 'playback');
        applicationController.connectOutlet('playlist', 'playlist', []);
        applicationController.connectOutlet('library', 'library', Tunes.get('data'));
        
        var playbackController = router.get('playbackController').connectControllers('playlist')
      },
      
      togglePlaying:  Em.K,
      prev:  Em.K,
      next:  Em.K,
      
      queueAlbum: function(router, event){
        var album = event.context;
        router.get('playlistController.content').addObject(album);
        router.transitionTo('tracksQueued');
      },
      
      tracksQueued: Ember.State.extend({
        togglePlaying: function(router){
          router.get('playbackController').togglePlaying();
        },
        
        prev:  function(router, event){
          
        },
        next:  function(router, event){
          
        },
        
        dequeueAlbum: function(router, event){
          var album = event.context,
              playlist = router.get('playlistController');
          
          playlist.removeObject(album);
          
          if (!playlist.get('length')) {router.transitionTo('index')}
        }
      })
      
    })
  })
});

Tunes.initialize()