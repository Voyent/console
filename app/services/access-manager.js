import Ember from 'ember';
import config from 'console/config/environment';


var AccessManager = Ember.Service.extend({

  login: function(account, username, password) {

    function expiredCallback(){
            return new Ember.RSVP.Promise( function(resolve, reject){ // jshint ignore:line
                alert('your session has expired');
                window.location.hash = '/';
                resolve();
            });
        }

    return new Ember.RSVP.Promise( (resolve, reject) => {
      if( !username || !password || !account){
        var err = 'AccessManager.login() username and password and account not supplied, exiting';
        this.warn(err);
        reject(err);
      }
      else{
        bridgeit.io.startTransaction();
        var bridgeitParams = {
          host: config.host,
          account: account,
          username: username,
          password: password,
          usePushService: false,
          ssl: true,
          connectionTimeout: 60, 
          onSessionExpiry: expiredCallback
        };
        return bridgeit.io.auth.connect(bridgeitParams).then(resolve)['catch'](reject);
      }
    });
    
  },

  logout: function(){
    bridgeit.io.auth.disconnect();
    bridgeit.io.endTransaction();
    
  },

  isLoggedIn: function(){
    return bridgeit.io.auth.isLoggedIn();
  },

  loadAccountInfo: function(){
    return bridgeit.io.admin.getAccount();
  },


});
export default AccessManager;