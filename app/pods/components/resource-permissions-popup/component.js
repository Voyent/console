import Ember from 'ember';
import utils from 'console/helpers/utils';

export default Ember.Component.extend({

	resource: null,
	resourcePermissions: null,
	resourcePermissionsRoles: [],
	editing: false,
	error: null,
	service: null,
	toast: null,
	tableTabShown: true,
	editedResourcePermissionsStr: null,
	valid: true,
	validationMsg: null,
	ownernames: [],

	open: function(){
		Ember.$('#resourcePermissionsPopup').modal();
	},

	edit: function(){
		this.set('editing', true);

		//we have to transform the permission json structure into a boolean structure

		let perms = ['r', 'u', 'd', 'x', 'pr', 'pu', 'mu'];
		let resourcePermissions = this.get('resourcePermissions');
		let rights = resourcePermissions.rights;
		let editedPermissions =  {owner: resourcePermissions.owner, roles: {}, roles_r: {}, roles_u: {}, roles_d: {},
			roles_x: {}, roles_pr: {}, roles_pu: {}, roles_mu: {}};

		//owner
		perms.forEach((p) => editedPermissions['owner_' + p] = false); //set all owner rights to false at first
		rights.owner.forEach((p) => editedPermissions['owner_' + p] = true); //then set all listed rights to true

		//realm
		perms.forEach((p) => editedPermissions['realm_' + p] = false); //set all owner rights to false at first
		rights.realm.forEach((p) => editedPermissions['realm_' + p] = true); //then set all listed rights to true

		let roles = Object.keys(rights.roles);
		roles.forEach((r) => {
			editedPermissions.roles[r] = {};
			perms.forEach((p) => editedPermissions.roles[r][p] = false); //set all owner rights to false at first
			rights.roles[r].forEach((p) => {
				editedPermissions['roles_' + p][r] = true;
			}); //then set all listed rights to true
		});

		this.set('editedPermissions', editedPermissions);

	},

	close: function(){
		Ember.$('#resourcePermissionsPopup').modal('hide');
		this.sendAction('onclose');
	},

	didReceiveAttrs: function(){
		console.log('resource-permissions-popup.didReceiveAttrs()');
		this.fetchResourcePermissions();
	},

	didUpdateAttrs: function(){
		console.log('resource-permissions-popup.didUpdateAttrs()');
		this.fetchResourcePermissions();
	},

	didInsertElement: function(){
		console.log('resource-permissions-popup.didInsertElement()');
		this.open();
		if( this.get('editing')){
			this.edit();
		}
	},

	fetchResourcePermissions: function(){
		let service = this.get('service');
		let resource = this.get('resource');
		let path = this.get('path');

		if( service && resource ){
			voyent.io[service].getResourcePermissions({id: resource._id, path: path})
				.then((resourcePermissions) => {
					this.set('resourcePermissions', resourcePermissions);
					if( resourcePermissions && resourcePermissions.rights && resourcePermissions.rights.roles ){
						this.set('resourcePermissionsRoles', Object.keys(resourcePermissions.rights.roles));
					}
				});

		}
		else{
			let msg = 'Cannot load recource permissions: service=' + service + ' resource=' + (resource ? resource._id : null);
			let toast = this.get('toast');
			if( toast ){
				toast.error(msg);
			}
			console.error(msg);
		}
	},

	editedResourcePermissionsStrChanged: function(){
		var input = this.get('editedResourcePermissionsStr');
		try{
			JSON.parse(input);
			this.set('valid', true);
			this.set('validationMsg', '');
		}
		catch(e){
			this.set('valid', false);
			this.set('validationMsg', e);
		}
	}.observes('editedResourcePermissionsStr'),

	actions: {
		close: function(){
			this.close();
		},

		edit: function(){
			this.edit();
		},

		cancelEdit: function(){
			this.set('editing', false);
		},

		save: function(){
			if( this.get('editing')){
				let toast = this.get('toast');
				let editedPerms = this.get('editedPermissions');
				let resourcePerms = this.get('resourcePermissions');
				resourcePerms.owner = editedPerms.owner;
				let perms = ['r', 'u', 'd', 'x', 'pu', 'pr', 'mu'];

				let ownerPerms = [];
				perms.forEach((p) => {
					if( editedPerms['owner_' + p]){
						ownerPerms.push(p);
					}
				});
				resourcePerms.rights.owner = ownerPerms;

				let realmPerms = [];
				perms.forEach((p) => {
					if( editedPerms['realm_' + p]){
						realmPerms.push(p);
					}
				});
				resourcePerms.rights.realm = realmPerms;

				let roles = this.get('resourcePermissionsRoles');
				resourcePerms.rights.roles = {};
				roles.forEach((role) => {
					resourcePerms.rights.roles[role] = {};
					let rolePerms = [];
					perms.forEach((p) => {
						if( editedPerms['roles_' + p][role]){
							rolePerms.push(p);
						}
					});
					resourcePerms.rights.roles[role] = rolePerms;
				});

				let service = this.get('service');
				let resource = this.get('resource');
				let path = this.get('path');

				if( service && resource ){
					voyent.io[service].updateResourcePermissions({id: resource._id, permissions: resourcePerms, path: path})
						.then((response) => {
							if( toast ){
								toast.info('Updated permissions');
								this.close();
							}
							console.log('updated resource permissions', response);
						}).catch((err) => {
							var errorMessage = utils.extractErrorMessage(err);
							if( toast ){
								toast.error('Error Updating Permission', errorMessage);
							}
							console.error('Error updating permission', errorMessage);
						});

				}
				else{
					let msg = 'Cannot update recource permissions: service=' + service + ' resource=' + (resource ? resource._id : null);
					if( toast ){
						toast.error(msg);
					}
					console.error(msg);
				}

			}
		},

		showTableTab: function(){
			this.set('tableTabShown', true);
		},

		showJSONTab: function(){
			this.set('tableTabShown', false);
		},

		addRole: function(){
			var newRole = this.get('newRole');
			this.get('resourcePermissionsRoles').pushObject(newRole);
			this.set('newRole', null);
		},

		deleteRole: function(role){
			this.get('resourcePermissionsRoles').removeObject(role);
		}

	}
});
