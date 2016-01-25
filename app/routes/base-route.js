import Ember from 'ember';

export default Ember.Route.extend({

  debug: function(msg, obj){
    if( 'console' in window && config.isDev ){
      console.log(msg, obj);
    }
  },

  info: function(msg, obj){
    if( 'console' in window ){
      console.info(msg, obj);
    }
  },

  warn: function(msg, obj){
    if( 'console' in window ){
      console.warn(msg, obj);
    }
  },

  error: function(msg, obj){
    if( 'console' in window ){
      console.error(msg, obj);
    }
  },

  afterModel: function(){
    this.controllerFor('application').set('loading', false);
  },

  deactivate: function(){
    this.get('controller').send('reset');
  },

  actions: {
    loading: function() {
      this.controllerFor('application').set('loading', true);
      return true;
    },
    error: function(err){
      console.error(err);
      this.controllerFor('application').set('loading', false);
      
    }
  }

  
});
