import BaseController from 'console/controllers/base-controller';
import utils from 'console/helpers/utils';
import RealmMixin from 'console/controllers/realm-mixin';
//import Ember from 'ember';

export default BaseController.extend( RealmMixin, {

  //TODO add dirty form check before navigating
  //TODO add more user-friendly json editor

  actions: {
    saveRealm: function() {
      var realm = this.get('model');

      realm.saveEditedProperties();
      
      bridgeit.io.admin.updateRealm({realm: realm.serialize()}).then(() => {
        this.get('toast').info('Successfully updated realm information', 'Realm Updated');
        this.transitionToRoute('secure.realms.index');
      }).catch((err) => {
        var errorMessage = utils.extractErrorMessage(err);
        this.get('toast').error(errorMessage, 'Error');
      });
    },

    cancel: function() {
      this.send('reset');
      this.transitionToRoute('secure.realms.index');
    },

  }

});
