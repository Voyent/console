import Ember from 'ember';

export default Ember.Controller.extend({

  application: Ember.inject.controller(),
  accessManager: Ember.inject.service(),

  showErrorMsg: function(msg){
    this.set('errorMsg', msg);
    window.openModal('#errorModal');
  },

  startLongRunningAction: function(){
    console.log('startLongRunningAction()');
    Ember.$('.loading').addClass('active');
  },
  stopLongRunningAction: function(){
    console.log('stopLongRunningAction()');
    Ember.$('.loading').removeClass('active');
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
      console.log('gotoLogin()');
      setTimeout( function(){
        console.log('focussing on username');
        Ember.$('#username').focus();
      }, 500);
      this.transitionToRoute('login');
    },
    

  },
  
});