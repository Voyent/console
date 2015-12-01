import Ember from 'ember';
import BaseController from 'admin/controllers/base-controller';
import utils from 'admin/helpers/utils';
import Account from 'admin/models/account';
import User from 'admin/models/user';

export default BaseController.extend({

	account: null,
	errorMessage: null,
	errorTitle: null,
	isLoggedIn: false,	
	
	updateAccountInfo: function(){
		return this.get('accessManager').loadAccountInfo().then((account) => {
			this.set('account', Account.create(account));
			var username = bridgeit.io.auth.getLastKnownUsername();
			var admin = account.admins.filter(a => a.username === username)[0];
			this.set('currentUser', User.create(admin));
		}).then(() => {
			return bridgeit.io.admin.getServiceDefinitions();
		}).then( (services) => {
			this.get('account').loadServiceModels(services);
		});
	},

	showErrorMessage: function(error, title){
		var errorMessage = utils.extractErrorMessage(error);
		this.set('errorTitle', title);
		this.set('errorMessage', errorMessage);
		Ember.$('#errorModal').modal();
	},

	actions: {
		closeErrorModal: function(){
			Ember.$('#errorModal').modal('hide');
			this.set('errorMessage', null);
		},

		logout: function(){
			this.get('accessManager').logout();
			this.set('isLoggedIn', false);
			this.set('currentUser', null);
			this.set('account', null);
			bridgeit.io.endTransaction();
			this.transitionToRoute('index');
		},	
	}

	

});
