import BaseController from 'console/controllers/base-controller';
import Ember from 'ember';
import utils from 'console/helpers/utils';

export default BaseController.extend({

  selectedUser: null,

  actions: {
    openUserInfoModal: function(user){
      this.set('selectedUser', user);
      Ember.$('#userInfoModal').modal();
    },
    closeUserInfoModal: function(){
      this.set('selectedUser', null);
      Ember.$('#userInfoModal').modal('hide');
    },
    openConfirmDeleteUserPopup: function() {
      Ember.$('#confirmDeleteUserModal').modal();
    },
    closeConfirmDeleteUserPopup: function() {
      Ember.$('#confirmDeleteUserModal').modal('hide');
    },
    confirmDeleteUser: function(user){
      this.set('selectedUser', user);
      this.send('openConfirmDeleteUserPopup');
    },
    cancelDeleteUser: function(){
      this.send('closeConfirmDeleteUserPopup');
      this.set('selectedUser', null);
    },
    deleteUserConfirmed: function(){

      var user = this.get('selectedUser');

      bridgeit.io.admin.deleteRealmUser({username: user.get('username')}).then(() => {
        var realm = this.get('model');
        realm.get('users').removeObject(user);
        this.get('toast').info('Successfully deleted user ' + user.get('fullname'));
        this.send('closeConfirmDeleteUserPopup');
        this.set('selectedUser',null);
      }).catch((error) => {
        console.error('deleteUser error: ' + error);
        var errorMessage = utils.extractErrorMessage(err);
        this.get('toast').error(error);
      });
    },
  }

});
