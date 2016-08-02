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
        voyent.io.startTransaction();
        var voyentParams = {
          host: config.host,
          account: account,
          username: username,
          password: password,
          usePushService: false,
          ssl: false,
          connectionTimeout: 60,
          onSessionExpiry: expiredCallback
        };
        return voyent.io.auth.connect(voyentParams).then(resolve)['catch'](reject);
      }
    });

  },

  logout: function(){
    voyent.io.auth.disconnect();
    voyent.io.endTransaction();

  },

  isLoggedIn: function(){
    return voyent.io.auth.isLoggedIn();
  },

  loadAccountInfo: function(){
    return voyent.io.admin.getAccount();
  },


});
export default AccessManager;
