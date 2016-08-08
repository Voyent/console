import BaseController from 'console/controllers/base-controller';
import validation from 'console/helpers/voyent-validation';
import Ember from 'ember';
import User from 'console/models/user';

export default BaseController.extend({

  selectedAdmin: null,

  validateRequiredFields: function(){
    var valid = true;
    if( !this.get('selectedAdmin.username') || this.get('selectedAdmin.username').length === 0 ){
        this.set('usernameMsg', 'Please enter a username.');
        valid = false;
    }
    if( !this.get('selectedAdmin.email') || this.get('selectedAdmin.email').length === 0 ){
        this.set('emailMsg', 'Please enter an email.');
        valid = false;
    }
    if( !this.get('selectedAdmin.firstname') || this.get('selectedAdmin.firstname').length === 0 ){
        this.set('firstnameMsg', 'Please enter the first name.');
        valid = false;
    }
    if( !this.get('selectedAdmin.lastname') || this.get('selectedAdmin.lastname').length === 0 ){
        this.set('lastnameMsg', 'Please enter the last name.');
        valid = false;
    }
    if( this.get('selectedAdmin.password') && (!this.get('selectedAdmin.password_confirm') ||
      this.get('selectedAdmin.password_confirm').length === 0) ){
        this.set('passwordconfirmMsg', 'Please confirm the password.');
        valid = false;
    }
    return valid;
  },

  validateRequiredPassword: function(){
    var valid = true;
    if( !this.get('selectedAdmin.password') || this.get('selectedAdmin.password').length === 0 ){
      this.set('passwordMsg', 'Please enter the password.');
      valid = false;
    }
    return valid;
  },

  validateEmail: function(){
    if( !validator.isEmail(this.get('selectedAdmin.email'))){
        this.set('emailMsg', 'Please enter a valid email.');
    }
    else{
        this.set('emailMsg', '');
    }
  },

  validateFirstname: function(){
      if( this.get('selectedAdmin.firstname') && this.get('selectedAdmin.firstname').length > 2 ){
          this.set('firstnameMsg', '');
      }
  },

  validateLastname: function(){
      if( this.get('selectedAdmin.lastname') && this.get('selectedAdmin.lastname').length > 2 ){
          this.set('lastnameMsg', '');
      }
  },

  validatePassword: function(){
      var password = this.get('selectedAdmin.password');
      if( password && !validation.passwordValidator(password)){
          this.set('passwordMsg', validation.passwordMsg);
      }
      else{
          this.set('passwordMsg', '');
      }
  },

  validatePasswordConfirm: function(){
      var password = this.get('selectedAdmin.password');
      if( password && !validator.equals(password, this.get('selectedAdmin.password_confirm'))){
          this.set('passwordconfirmMsg', 'Passwords do not match.');
      }
      else{
          this.set('passwordconfirmMsg', '');
      }
  },

  validateUsername: function(){
      if( !validation.usernameValidator(this.get('selectedAdmin.username'))){
          this.set('usernameMsg', validation.usernameMsg);
      }
      else{
          this.set('usernameMsg', '');
      }
  },

  openEditAdminModal: function() {
    Ember.$('#editAdminModal').modal();
  },

  closeEditAdminModal: function() {
    Ember.$('#editAdminModal').modal('hide');
  },

  openCreateAdminModal: function() {
    Ember.$('#createAdminModal').modal();
  },

  closeCreateAdminModal: function(){
    Ember.$('#createAdminModal').modal('hide');
  },

  openConfirmDeleteAdminModal: function() {
    Ember.$('#confirmDeleteAdminModal').modal();
  },

  closeConfirmDeleteAdminModal: function(){
    Ember.$('#confirmDeleteAdminModal').modal('hide');
  },

  resetErrorMessages: function(){
    ['errorMsg', 'emailMsg', 'usernameMsg', 'passwordMsg', 'firstnameMsg', 'lastnameMsg'].forEach( (prop) => {
      this.set(prop, "");
    });
  },

  actions: {

    /* Create Admin */
    cancelCreateAdmin: function(){
        this.set('selectedAdmin', null);
        this.closeCreateAdminModal();
        this.resetErrorMessages();
    },

    openCreateAdmin: function(){
        this.set('selectedAdmin', Ember.Object.create());
        this.openCreateAdminModal();
    },

    createAdmin: function(){

      if( !this.validateRequiredFields() || !this.validateRequiredPassword()){
        return;
      }

      this.validateUsername();
      this.validateEmail();
      this.validateFirstname();
      this.validateLastname();
      this.validatePassword();
      this.validatePasswordConfirm();

      //check error msgs
      if( this.get('usernameMsg') ||
          this.get('emailMsg') ||
          this.get('firstnameMsg') ||
          this.get('lastnameMsg') ||
          this.get('passwordMsg') ||
          this.get('passwordconfirmMsg')){
          this.warn('invalid create new admin form, exiting');
          return;
      }

      var admin = this.get('selectedAdmin');
      if( admin ){
        return voyent.io.admin.createAdministrator({admin: admin}).then(() => {
          return this.get('application').updateAccountInfo();
        }).then(() => {
          this.send('cancelCreateAdmin');
        }).catch((err) => {
          this.get('application').showErrorMessage(err, 'Server Error');
        });
      }
    },

    /* Delete Admin */
    cancelDeleteAdmin: function(){
        this.set('selectedAdmin', null);
        this.closeConfirmDeleteAdminModal();
        this.resetErrorMessages();
    },

    confirmDeleteAdmin: function(admin){
        this.set('selectedAdmin', admin);
        this.openConfirmDeleteAdminModal();
    },

    deleteAdminConfirmed: function(){
      var admin = this.get('selectedAdmin');
      if( admin ){
        return voyent.io.admin.deleteAdministrator({username: admin.username}).then(() => {
          return this.get('application').updateAccountInfo();
        }).then(() => {
          this.send('cancelDeleteAdmin');
        }).catch((err) => {
          this.get('application').showErrorMessage(err, 'Server Error');
        });
      }
    },

    /* Edit Admin */
    openEditAdmin: function(admin){
      this.set('selectedAdmin', User.create(admin.serialize()));
      this.openEditAdminModal();
    },

    cancelEditAdmin: function(){
        this.set('selectedAdmin', null);
        this.closeEditAdminModal();
        this.resetErrorMessages();
    },

    updateAdmin: function(){
      if( !this.validateRequiredFields() ){
          return;
      }

      var admin = this.get('selectedAdmin');

      this.validateEmail();
      this.validateFirstname();
      this.validateLastname();
      this.validatePassword();
      this.validatePasswordConfirm();


      //check error msgs
      if( this.get('emailMsg') ||
          this.get('firstnameMsg') ||
          this.get('lastnameMsg') ||
          this.get('passwordMsg') ||
          this.get('passwordconfirmMsg')){
          this.warn('invalid edit admin form, exiting');
          return;
      }

      // Clear out any error messages.
      ['errorMsg', 'emailMsg', 'usernameMsg',
        'passwordMsg', 'firstnameMsg', 'lastnameMsg'].forEach( (prop) => {
        this.set(prop, "");
      });

      if(typeof admin.roles === 'string'){
        console.log('Split');
        console.log(admin.roles.split(','));
        this.set('selectedAdmin.roles',admin.roles.split(','));
      }

      voyent.io.admin.updateAdministrator({admin: admin}).then( () => {
        return this.get('application').updateAccountInfo();
      }).then(() => {
        this.send('cancelEditAdmin');
      }).catch((err) => {
        this.get('application').showErrorMessage(err, 'Server Error');
      });
    },

  }

});
