import Ember from 'ember';
import config from 'console/config/environment';

export default Ember.Controller.extend({

  application: Ember.inject.controller(),
  accessManager: Ember.inject.service(),

  showErrorMsg: function(msg){
    this.set('errorMsg', msg);
    window.openModal('#errorModal');
  },

  startLongRunningAction: function(){
    Ember.$('.loading').addClass('active');
  },
  stopLongRunningAction: function(){
    Ember.$('.loading').removeClass('active');
  },

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