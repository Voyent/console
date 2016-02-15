import Ember from 'ember';
import BaseController from 'console/controllers/base-controller';
import validation from 'console/helpers/bridgeit-validation';

var Form = {
    _datafields: ['username', 'account', 'accountdescription', 'password', 'password_confirm', 'email', 'firstname', 'lastname'],
    _msgfields: ['errorMsg', 'accountMsg', 'infoMsg', 'emailMsg', 'firstnameMsg', 'lastnameMsg', 'usernameMsg', 'passwordMsg', 'passwordconfirmMsg']
};

export default BaseController.extend({

    formDataEntered: false,
    
    formDataChanged: function(val){
        if( val ){
            this.set('formDataEntered', true);
        }
    }.observes(Form._datafields),

    _validateUsername: function(){
        if( !validation.usernameValidator(this.get('username'))){
            this.set('usernameMsg', validation.usernameMsg);
            Ember.$('#username').focus();
            return;
        }
        else{
            this.set('usernameMsg', '');
        }
    },
    _validateAccount: function(){
        if( !validation.accountNameValidator(this.get('account'))){
            this.set('accountMsg', validation.accountNameMsg);
        }
        else{
            this.set('accountMsg', '');
        }
    },
    _validateEmail: function(){
        if( !validator.isEmail(this.get('email'))){
            this.set('emailMsg', 'Please enter a valid email.');
        }
        else{
            this.set('emailMsg', '');
        }
    },
    _validateFirstName: function(){
        if( !validation.nameValidator(this.get('firstname'))){
            this.set('firstnameMsg', validation.nameMsg);
        }
        else{
            this.set('firstnameMsg', '');
        }
    },
    _validateLastName: function(){
        if( !validation.nameValidator(this.get('lastname'))){
            this.set('lastnameMsg', validation.nameMsg);
        }
        else{
            this.set('lastnameMsg', '');
        }
    },
    _validatePassword: function(){
        if( !validation.passwordValidator(this.get('password'))){
            this.set('passwordMsg', validation.passwordMsg);
        }
        else{
            this.set('passwordMsg', '');
        }
    },
    _validatePasswordConfirm: function(){
        if( !validator.equals(this.get('password'), this.get('password_confirm'))){
            this.set('passwordconfirmMsg', 'Passwords do not match.');
        }
        else{
            this.set('passwordconfirmMsg', '');
        }
    },

    validateRequiredFields: function(form){
        var valid = true;
        if( !form.username || form.username.length === 0 ){
            this.set('usernameMsg', 'Please enter a username.');
            valid = false;
        }
        if( !form.account || form.account.length === 0 ){
            this.set('accountMsg', 'Please enter an account name.');
            valid = false;
        }
        if( !form.email || form.email.length === 0 ){
            this.set('emailMsg', 'Please enter an email.');
            valid = false;
        }
        if( !form.firstname || form.firstname.length === 0 ){
            this.set('firstnameMsg', 'Please enter your first name.');
            valid = false;
        }
        if( !form.lastname || form.lastname.length === 0 ){
            this.set('lastnameMsg', 'Please enter your last name.');
            valid = false;
        }
        if( !form.password || form.password.length === 0 ){
            this.set('passwordMsg', 'Please enter a password.');
            valid = false;
        }
        if( !form.password_confirm || form.password_confirm.length === 0 ){
            this.set('passwordconfirmMsg', 'Please confirm your password.');
            valid = false;
        }
        return valid;
    },

    actions: {

        reset: function() {
            var props = {};
            Form._datafields.forEach( function(val){
                props[val] = "";
            });
            Form._msgfields.forEach( function(val){
                props[val] = "";
            });
            this.setProperties(props);
        },

        validateUsername: function(){
            this._validateUsername();
        },

        validateUsernameOnBlur: function(){
            if( this.get('username')){
                this._validateUsername();
            }
        },

        validateAccount: function(){
            this._validateAccount();
        },

        validateAccountOnBlur: function(){
            if( this.get('account')){
                this._validateAccount();
            }
        },

        validateEmail: function(){
            this._validateEmail();
        },

        validateEmailOnBlur: function(){
            if( this.get('email')){
                this._validateEmail();
            }
        },

        validateFirstName: function(){
            this._validateFirstName();
        },

        validateFirstNameOnBlur: function(){
            if( this.get('firstname')){
                this._validateFirstName();
            }
        },

        validateLastName: function(){
            if( this.get('lastname')){
                this._validateLastName();
            }
        },

        validateLastNameOnBlur: function(){
            if( this.get('lastname')){
                this._validateLastName();
            }
        },

        validatePassword: function(){
            this._validatePassword();
        },

        validatePasswordOnBlur: function(){
            if( this.get('password')){
                this._validatePassword();
            }
        },

        validatePasswordConfirm: function(){
            this._validatePasswordConfirm();
        },

        validatePasswordConfirmOnBlur: function(){
            if( this.get('password_confirm')){
                this._validatePasswordConfirm();
            }
        },

        cancel: function(){
            this.send('reset');
            this.transitionToRoute('login');
        },

        register: function() {

          var form = this.getProperties(Form._datafields);

          if( !this.validateRequiredFields(form) ){
              return;
          }

          this._validateUsername();
          this._validateAccount();
          this._validateEmail();
          this._validateFirstName();
          this._validateLastName();
          this._validatePassword();
          this._validatePasswordConfirm();

          //check error msgs
          if( this.get('usernameMsg') || this.get('accountMsg') || this.get('emailMsg') ||
              this.get('firstnameMsg') || this.get('lastnameMsg') || this.get('passwordMsg') ||
              this.get('passwordconfirmMsg')){
              this.warn('invalid register form, exiting');
              return;
          }

          this.send('startLongRunningAction');
          var appController = this.get('application');
          
          delete form.password_confrm;
          
          // Clear out any error messages.
          var props = {};
          Form._msgfields.forEach( function(val){
              props[val] = "";
          });
          this.setProperties(props);

          bridgeit.io.admin.createAccount({
              account: form.account,
              description: form.accountdescription,
              username: form.username,
              email: form.email,
              firstname: form.firstname,
              lastname: form.lastname,
              password: form.password
          }).then(() => {
              this.send('stopLongRunningAction');
              appController.set('isLoggedIn', true);
              appController.showInfoMessage('Thank you, your account was successfully created.');
              return appController.updateAccountInfo();
          }).then(() => {
              this.transitionToRoute('secure.index');
          }).catch((error) => {
              this.warn('register failed', error);
              appController.showErrorMessage(error, 'Account Registration Failed');
              this.send('stopLongRunningAction');
          });
        },

        willTransition: function(transition) {
            if (this.get('formDataEntered') && !confirm("Are you sure you want to leave?")) {
                transition.abort();
            } else {
                // Bubble the `willTransition` action so that
                // parent routes can decide whether or not to abort.
                return true;
            }
        }
    }

});