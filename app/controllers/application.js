import Ember from 'ember';
import BaseController from 'console/controllers/base-controller';
import utils from 'console/helpers/utils';
import Account from 'console/models/account';
import User from 'console/models/user';

export default BaseController.extend({

  account: null,
  errorMessage: null,
  errorTitle: null,
  isLoggedIn: false,

  updateAccountInfo: function(){
    return this.get('accessManager').loadAccountInfo().then((account) => {
      this.set('account', Account.create(account));
      var username = voyent.io.auth.getLastKnownUsername();
      var admin = account.admins.filter(a => a.username === username)[0];
      this.set('currentUser', User.create(admin));
    }).then(() => {
      return voyent.io.admin.getServiceDefinitions();
    }).then( (services) => {
      this.get('account').loadServiceModels(services);
    }).catch((error) => {
      this.error('could not load account info');
      this.showErrorMessage(error, 'Could not load Account Info');
    });
  },

  showErrorMessage: function(error, title){
    var errorMessage = utils.extractErrorMessage(error);
    this.get('toast').error(errorMessage, title);
  },

  showInfoMessage: function(msg){
    this.get('toast').info(msg);
  },

  actions: {
    closeErrorModal: function(){
      Ember.$('#errorModal').modal('hide');
      this.set('errorMessage', null);
    },

    logout: function(){
      this.get('accessManager').logout();
      this.set('isLoggedIn', false);
      this.set('currentUser', null);
      this.set('account', null);
      voyent.io.endTransaction();
      this.transitionToRoute('index');
    },
  }



});
