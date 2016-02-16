import Ember from 'ember';
//import Realm from 'console/models/realm';
import User from 'console/models/user';
import utils from 'console/helpers/utils';

export default Ember.Route.extend({

  model: function(params){
    var realm = this.modelFor('secure.realms');
    var userId = params.user_id;
    return bridgeit.io.admin.getRealmUser({username: userId}).then( user => {
      var userModel = User.create(user);
      userModel.set('realm', realm);
      return userModel;
    }).catch((error) => {
      this.warn('could not retrieve user ' + userId);
      var errorMessage = utils.extractErrorMessage(error);
      this.get('toast').error(errorMessage);
      this.transitionTo('secure.realms.users.index');
    });
  },
  
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.send('reset');
  },

});