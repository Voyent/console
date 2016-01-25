import Ember from 'ember';

export default Ember.Object.extend({

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

});