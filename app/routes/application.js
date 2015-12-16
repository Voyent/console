import Ember from 'ember';
import BaseRoute from 'console/routes/base-route';

export default BaseRoute.extend({

  accessManager: Ember.inject.service(),

  beforeModel: function(transition){ // jshint ignore:line

    var accessManager = this.get('accessManager');
    var isLoggedIn = accessManager.isLoggedIn();
    console.log('application.beforeModel() isLoggedIn: ' + isLoggedIn);
    if( isLoggedIn) {
      console.log('setting application.loggedin ' + isLoggedIn);
      var appController = this.controllerFor('application');
      appController.set('isLoggedIn', isLoggedIn);
      return appController.updateAccountInfo();
    }
  },


});
