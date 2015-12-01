import Ember from 'ember';
import config from 'admin/config/environment';


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
				console.debug(err);
				reject(err);
			}
			else{
				console.log('AccessManager.logging in to judging'  );
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
		console.log('AccessManager.logout()');
		bridgeit.io.auth.disconnect();
		bridgeit.io.endTransaction();
		
	},

	isLoggedIn: function(){
		return bridgeit.io.auth.isLoggedIn();
	},

	loadAccountInfo: function(){
		return bridgeit.io.admin.getAccount().catch(function(error){
			console.log('error fetching user', error);
		});
	},


});
export default AccessManager;