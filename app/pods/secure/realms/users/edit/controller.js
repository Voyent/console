import BaseController from 'console/controllers/base-controller';
import Ember from 'ember';
import bridgeitValidation from 'console/helpers/bridgeit-validation';
import utils from 'console/helpers/utils';

var EditUserForm = {
  _datafields: ['password', 'password_confirm', 'email', 'firstname', 'lastname', 'disabled'],
};

EditUserForm._msgfields = EditUserForm._datafields.map(function(field){ return field+'Msg';});


export default BaseController.extend({

  realmsController: Ember.inject.controller('secure.realms'),

  onCustomInfoEntry: function(){
    var customInfoInput = this.get('customText');
    var customDocumentValidMsg = '';
    var valid = false;
    if( customInfoInput ){
      try{
        JSON.parse(customInfoInput);
        valid = true;
      }
      catch(e){
        valid = false;
        customDocumentValidMsg = e;
      }
    }
    else{
      valid = true;
    }
    this.set('customDocumentValid', valid);
    this.set('customDocumentValidMsg', customDocumentValidMsg);
    
  }.observes('customText'),

  validateRequiredFields: function(){
    var valid = true;
    var msg;
    if( !this.get('model.username') || this.get('model.username').length === 0 ){
      msg = 'Please enter a username.';
      this.set('usernameMsg', msg);
      this.set('errorMsg', this.get('errorMsg') + ' ' + msg);
      valid = false;
    }
    if( !this.get('model.email') || this.get('model.email').length === 0 ){
      msg = 'Please enter an email.';
      this.set('emailMsg', msg);
      this.set('errorMsg', this.get('errorMsg') + ' ' + msg);
      valid = false;
    }
    if( !this.get('model.firstname') || this.get('model.firstname').length === 0 ){
      msg = 'Please enter your first name.';
      this.set('firstnameMsg', msg);
      this.set('errorMsg', this.get('errorMsg') + ' ' + msg);
      valid = false;
    }
    if( !this.get('model.lastname') || this.get('model.lastname').length === 0 ){
      msg = 'Please enter your last name.';
      this.set('lastnameMsg', msg);
      this.set('errorMsg', this.get('errorMsg') + ' ' + msg);
      valid = false;
    }
    return valid;
  },

  actions: {
    cancel: function() {
      this.send('reset');
      this.transitionToRoute('secure.realms.users.index');
    },
    reset: function() {
      this._super();
      var self = this;
      EditUserForm._msgfields.forEach( function(f){ self.set(f,'');});
    },
    save: function(){
      this.debug('save user');

      if( !this.validateRequiredFields() ){
        return;
      }

      this.send('validateEmail');
      this.send('validateFirstname');
      this.send('validateLastname');
      this.send('validatePassword');
      this.send('validatePasswordConfirm');
      this.send('validatePermissions');

      //check error msgs
      if( this.get('emailMsg') ||
        this.get('firstnameMsg') ||
        this.get('lastnameMsg') ||
        this.get('passwordMsg') ||
        this.get('passwordconfirmMsg') ||
        this.get('permissionsMsg')){
        this.warn('invalid create new admin form, exiting');
        return;
      }

      var user = this.get('model');
      
      //set edited properties
      try{
        var customText = this.get('customText');
        var customJSON;
        if( customText ){
          customJSON = JSON.parse(customText);
          user.set('custom', customJSON);
        }
      }
      catch(e){
      }
      //set selected roles
      user.set('roles', this.get('model.roleWrappers').filter(w => w.get('selected')).map(w => w.get('content')));
      
      bridgeit.io.admin.updateRealmUser({user: user.serialize()}).then(() => {
        this.get('toast').info('Successfully edited user ' + user.get('fullname'));
        var realmController = this.get('realmsController');
        var realm = realmController.get('model');
        var users = realm.get('users');
        if( users ){
          realm.set('users', users.map((u) => {
              if( user.get('username') === u.get('username') ){
                return user;
              }
              else{
                return u;
              }
            }
          ));
          this.transitionToRoute('secure.realms.users.index');
        }
      }).catch((error) => {
          var errorMessage = utils.extractErrorMessage(error);
          this.get('toast').error(errorMessage);
        }
      );
      
    },
    validateUsername: function(){
      if( !bridgeitValidation.usernameValidator(this.get('model.username'))){
        this.set('usernameMsg', bridgeitValidation.usernameMsg);
        return;
      }
      else{
        this.set('usernameMsg', '');
      }
    },
    validateUsernameOnBlur: function(){
      if( this.get('model.username')){
        this.send('validateUsername');
      }
    },
    validateEmail: function(){
      var email = this.get('model.email');
      if( email && !validator.isEmail(email)){
        this.set('emailMsg', 'Please enter a valid email.');
      }
      else{
        this.set('emailMsg', '');
      }
    },
    validateEmailOnBlur: function(){
      if( this.get('model.email')){
        this.send('validateEmail');
      }
    },
    validateFirstname: function(){
      if( this.get('model.firstname') && this.get('model.firstname').length > 2 ){
        this.set('firstnameMsg', '');
      }
    },
    validateFirstnameOnBlur: function(){
      this.send('validateFirstname');
    },
    validateLastname: function(){
      if( this.get('model.lastname') && this.get('model.lastname').length > 2 ){
        this.set('lastnameMsg', '');
      }
    },
    validateLastnameOnBlur: function(){
      this.send('validateLastname');
    },
    validatePassword: function(){
      var password = this.get('password');
      if( password && !bridgeitValidation.passwordValidator(password)){
        this.set('passwordMsg', bridgeitValidation.passwordMsg);
      }
      else{
        this.set('passwordMsg', '');
      }
    },
    validatePasswordOnBlur: function(){
      if( this.get('password')){
        this.send('validatePassword');
      }
    },
    validatePasswordConfirm: function(){
      var password = this.get('password'),
        passwordConfirm = this.get('password_confirm');
      if( (password || passwordConfirm) && !validator.equals(password, passwordConfirm)){
        this.set('passwordconfirmMsg', 'Passwords do not match.');
      }
      else{
        this.set('passwordconfirmMsg', '');
      }
    },
    validatePasswordConfirmOnBlur: function(){
      if( this.get('password_confirm')){
        this.send('validatePasswordConfirm');
      }
    },
    validatePermissions: function(){
    },
    validatePermissionsOnBlur: function(){
      this.send('validatePermissions');
    },
    addNewPermissionField: function(){
      this.get('permissionWrappers').pushObject(Ember.Object.create({value: ''}));
    },
    removePermission: function(permission){
      this.get('permissionWrappers').removeObject(permission);
    }
  }

});
