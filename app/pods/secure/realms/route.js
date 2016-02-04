import Ember from 'ember';
import Realm from 'console/models/realm';

export default Ember.Route.extend({

  model: function(params) {
    var appController = this.controllerFor('application');
    var realms = appController.get('account.realms');
    return Realm.create(realms.filter( r => r.name === params.realm_id )[0]);
  },

  afterModel: function(model){
  	bridgeit.io.setCurrentRealm(model.get('name'));
  },

  deactivate: function(){
  	bridgeit.io.setCurrentRealm('admin');
  }

});