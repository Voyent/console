import Ember from 'ember';
import Realm from 'console/models/realm';

export default Ember.Route.extend({

  model: function(params) {
    var appController = this.controllerFor('application');
    var realms = appController.get('account.realms');
    return Realm.create(realms.filter( r => r.name === params.realm_id )[0]);
  },

});