import BaseController from 'console/controllers/base-controller';
import utils from 'console/helpers/utils';

export default BaseController.extend({

  queryParams: ['username'],
  username: null,

  actions: {
    reset: function() {
      this.setProperties({
        username: null,
        account: null
      });
    },
    submit: function(){
      var username = this.get('username');
      var account = this.get('account');

      if( !username ){
        this.get('toast').error('Please enter your username');
        return;
      }

      if( !account ){
        this.get('toast').error('Please enter your account name');
        return;
      }

      bridgeit.io.auth.forgotPassword({
        account: account,
        username: username
      }).then((result) => {
        if( result ){
          this.get('toast').info('An email with the credentials has been sent.');
        }
        else{
          this.get('toast').error("Sorry, an unknown error occurred.");
        }
        
      }).catch((error) => {
        this.get('toast').error(utils.extractErrorMessage(error));
      });
    }
    
  }

});
