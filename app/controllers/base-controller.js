import Ember from 'ember';
import config from 'console/config/environment';

export default Ember.Controller.extend({

  application: Ember.inject.controller(),
  accessManager: Ember.inject.service(),

  startLongRunningAction: function(){
    Ember.$('.loading').addClass('active');
  },
  stopLongRunningAction: function(){
    Ember.$('.loading').removeClass('active');
  },

  debug: function(msg, obj){
    if( 'console' in window && config.isDev ){
      if( obj ){
        console.log(msg, obj);
      }
      else{
        console.log(msg);
      }      
    }
  },

  info: function(msg, obj){
    if( 'console' in window ){
      if( obj ){
        console.info(msg, obj);
      }
      else{
        console.info(msg);
      }   
    }
  },

  warn: function(msg, obj){
    if( 'console' in window ){
      if( obj ){
        console.warn(msg, obj);
      }
      else{
        console.warn(msg);
      }   
    }
  },

  error: function(msg, obj){
    if( 'console' in window ){
      if( obj ){
        console.error(msg, obj);
      }
      else{
        console.error(msg);
      }   
    }
  },

  actions: {
    
    closeErrorModal: function(){
      this.set('errorMsg', null);
      window.closeModal('#errorModal');
    },
    startLongRunningAction: function(){
      this.startLongRunningAction();
    },
    stopLongRunningAction: function(){
      this.stopLongRunningAction();
    },
    logout: function(){
      this.logout();
    },
    gotoLogin: function(){
      this.debug('gotoLogin()');
      setTimeout( function(){
        Ember.$('#username').focus();
      }, 500);
      this.transitionToRoute('login');
    },
    

  },
  
});