import BaseController from 'console/controllers/base-controller';
import utils from 'console/helpers/utils';
//import Ember from 'ember';

export default BaseController.extend({

  actions: {
    editRealm: function() {
      var realm = this.get('model');

      //set edited properties
      realm.set('origins', realm.get('editedOrigins'));
      realm.set('services', realm.get('availableServiceWrappers').filter(function(wrapper){
        return wrapper.selected;
      }).map(function(wrapper){
        return wrapper.get('name');
      }));

      try{
        var customText = realm.get('customText');
        var customJSON;
        if( customText ){
          customJSON = JSON.parse(customText);
          realm.set('custom', customJSON);
        }
      }
      catch(e){
        console.error('error parsing custom text', e);
        this.get('toast').error('Error parsing custom text: ' + e.message, 'Error');
        return;
      }

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
