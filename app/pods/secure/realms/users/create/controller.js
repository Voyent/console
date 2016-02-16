import Ember from 'ember';
import BaseController from 'console/controllers/base-controller';
import utils from 'console/helpers/utils';
import validation from 'console/helpers/bridgeit-validation';
import errorMessages from 'console/helpers/bridgeit-error-msgs';

export default BaseController.extend({

  _msgfields: ['usernameMsg', 'passwordMsg', 'password_confirmMsg', 'emailMsg', 'firstnameMsg', 'lastnameMsg'],

  validateRequiredFields: function(){
    var valid = true;
    var model = this.get('model');
    if( !model.get('username') || model.get('username').length === 0 ){
      this.set('usernameMsg', 'Please enter a username.');
      valid = false;
    }
    if( !model.get('password') || model.get('password').length === 0 ){
      this.set('passwordMsg', 'Please enter a password.');
      valid = false;
    }
    if( !this.get('password_confirm') || this.get('password_confirm').length === 0 ){
      this.set('passwordconfirmMsg', 'Please confirm the password.');
      valid = false;
    }
    return valid;
  },

  validateUsername: function(){
    console.log('validating username');

    if( !validation.usernameValidator(this.get('model.username'))){
      this.set('usernameMsg', errorMessages.invalidUsername);
      return;
    }
    else{
      this.set('usernameMsg', '');
    }
  },

  validateEmail: function(){
    var email = this.get('model.email');
    if(email &&  !validator.isEmail(email)){
      this.set('emailMsg', errorMessages.invalidEmail);
    }
    else{
      this.set('emailMsg', '');
    }
  },

  validateFirstname: function(){
    var name = this.get('model.firstname');
    if( !name ){
      this.set('firstnameMsg', '');
      return;
    }
    if( name.length > 2 ){
      this.set('firstnameMsg', '');
    }
    else{
      this.set('firstnameMsg', errorMessages.invalidFirstname);
    }
  },

  validateLastname: function(){
    var name = this.get('model.lastname');
    if( !name ){
      this.set('lastnameMsg','');
      return;
    }
    if( name.length > 2 ){
      this.set('lastnameMsg', '');
    }
    else{
      this.set('lastnameMsg', errorMessages.invalidLastname);
    }
  },

  validatePassword: function(){
    if( !validation.passwordValidator(this.get('model.password'))){
      this.set('passwordMsg', errorMessages.invalidPassword);
    }
    else{
      this.set('passwordMsg', '');
    }
  },

  validatePasswordConfirm: function(){
    if( !validator.equals(this.get('model.password'), this.get('password_confirm'))){
      this.set('passwordconfirmMsg', errorMessages.passwordMismatch);
    }
    else{
      this.set('passwordconfirmMsg', '');
    }
  },

  actions: {

    reset: function() {
      this.get('_msgfields').forEach((f) => { this.set(f,'');});
    },
    
    cancel: function() {
      this.send('reset');
      this.transitionToRoute('secure.realms');
    },

    create: function(){

      if( !this.validateRequiredFields() ){
        this.get('toast').error('Please fill in all required fields and try again.', 'Missing required fields');
        Ember.$('body').animate({scrollTop: 0}, 200);
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
        this.get('passwordconfirmMsg') ||
        this.get('permissionsMsg')){
        this.get('toast').error('Please correct the field errors and try again.', 'Error');
        Ember.$('body').animate({scrollTop: 0}, 200);
        return;
      }

      var user = this.get('model');
      var realm = user.get('realm');
      user.saveEditedProperties();

      bridgeit.io.admin.createRealmUser({user: user.serialize()}).then((url) => {
        console.log('created the new user: ' + url);
        realm.get('users').pushObject(user);
        this.get('toast').info('Successfully created new user ' + user.get('username'), 'User created');
        this.transitionToRoute('secure.realms.users');
      }).catch((error) => {
        Ember.$('body').animate({scrollTop: 0}, 200);
        var errorMessage = utils.extractErrorMessage(error);
        this.get('toast').error(errorMessage, 'Error');
      });
    },

    validateUsernameOnBlur: function(){
      this.validateUsername();
    },
    
    validateEmailOnBlur: function(){
      if( this.get('model.email')){
        this.validateEmail();
      }
    },
    
    validateFirstnameOnBlur: function(){
      this.validateFirstname();
    },
    
    validateLastnameOnBlur: function(){
      this.validateLastname();
    },
    
    validatePasswordOnBlur: function(){
      this.validatePassword();
    },
    
    validatePasswordConfirmOnBlur: function(){
      if( this.get('password_confirm')){
        this.validatePasswordConfirm();
      }
    },
  }

});
