import Ember from 'ember';
import User from 'console/models/user';

export default Ember.Route.extend({

  model: function(params){
    var realm = this.modelFor('secure.realms');
    var userModel = User.create();
    userModel.set('realm', realm);
    return userModel;
  },


});