import BaseController from 'console/controllers/base-controller';
import RealmMixin from 'console/controllers/realm-mixin';

export default BaseController.extend( RealmMixin, {

  testUsers: null,
  customDocumentValid: true,

  actions: {
    cancel: function(){
      this.transitionToRoute('secure.index');
    },

    create: function(){
      var appController = this.get('application');
      var realm = this.get('model');

      if( !realm.get('name')){
        appController.showErrorMessage('Please enter the name of the new realm.');
        return;
      }
      realm.saveEditedProperties();
      var services = realm.get('services');

      if( realm.get('createTestUsers') && services ){
        var testUsers = realm.generateTestUsersForServices(services);
        realm.get('users').pushObjects(testUsers);
      }

      voyent.io.admin.createRealm({realm: realm.serialize()}).then((json) => {
        this.debug('voyent.io.admin.createRealm() resp', json);
        appController.showInfoMessage('Created new realm');
        var account = appController.get('account');
        realm.set('account', account);
        account.get('realms').pushObject(realm);
        this.transitionToRoute('secure.realms.index', realm);
      }).catch((error) => {
        appController.showErrorMessage(error);
      });
    }
  }
});
