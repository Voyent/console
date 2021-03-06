import BaseController from 'console/controllers/base-controller';

export default BaseController.extend({

  actions: {
    reset: function() {
      this.setProperties({
        username: '',
        password: '',
        login_error: ''
      });
    },

    login: function() {
      this.debug('loginController#login()');
      function validateUsername(){
        if( !this.get('username')){
          this.set('usernameMsg', 'Please enter your username.');
          return false;
        }
        else{
          this.set('usernameMsg', '');
          return true;
        }
      }

      function validatePassword(){
        if( !this.get('password')){
          this.set('passwordMsg',
            'Please enter your password.');
          return false;
        }
        else{
          this.set('passwordMsg', '');
          return true;
        }
      }

      function validateAccount(){
        if( !this.get('account')){
          this.set('accountMsg',
            'Please enter your account name.');
          return false;
        }
        else{
          this.set('accountMsg', '');
          return true;
        }
      }

      // Clear out any error messages.
      this.set('errorMessage', null);

      var validUsername =  validateUsername.apply(this);
      var validPassword = validatePassword.apply(this);
      var validAccount = validateAccount.apply(this);
      if( !validUsername || !validPassword || !validAccount){
        return;
      }
      var application = this.get('application');
      this.send('startLongRunningAction');
      window.voyent.io.auth.disconnect();
      var accessManager = this.get('accessManager');
      return accessManager.login(this.get('account'), this.get('username'), this.get('password')).then( () => {
        application.set('isLoggedIn', true);
        this.debug('loginController: successfully logged in');
        return application.updateAccountInfo();
      }).then(() => {
        this.send('stopLongRunningAction');
        this.transitionToRoute('secure.index');
      })['catch']( (reason) => {
        var msg;
        if( reason.status = 401 ){
          msg = 'Sorry, login failed.';
        }
        else{
          msg = reason.responseText || reason.message || reason;
        }
        this.warn('failed login: ' + msg);
        this.get('toast').error(msg);
        this.send('stopLongRunningAction');
      });
    },

    forgotPassword: function(){
      //if a username has been provided, set it on the forgot password form
      var username = this.get('username');
      this.transitionToRoute('/forgotpassword' + (username ? '?username=' + username : ''));
    }
  }

});
