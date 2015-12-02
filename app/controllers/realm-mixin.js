import Ember from 'ember';
import Role from 'console/models/role';
import Selectable from 'console/models/selectable';
import PermissionGroup from 'console/models/permission-group';

export default Ember.Mixin.create({

	originalEditedRole: null,
	editeRole: null,
	editedRoleName: null,
	editedRolePermissionGroups: [],

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

	actions: {

		addNewOriginField: function(){
			console.log('addNewOriginField()');
			this.get('model.origins').pushObject('');
		},

		removeOriginField: function(o){
			var origins = this.get('model').get('origins');
			if( o ){
				origins.removeObject(o);
			}
			else{
				origins.removeAt(origins.length-1);
			}
		},

		addNewRole: function(){
			console.log('addNewRole()');
			var realm = this.get('model');
			this.set('editedRole', Role.create({isNew: true}));
			this.set('editedRoleName', '');
			this.set('editedRolePermissionGroups', realm.getAvailablePermissionGroups());
			Ember.$('#editRoleModal').modal();
		},

		cancelEditedRole: function(){
			this.set('editedRole', null);
			this.set('editedRoleName', null);
			this.set('editedRolePermissionGroups', []);
			Ember.$('#editRoleModal').modal('hide');
		},

		saveEditedRole: function(){
			var role = this.get('editedRole');
			var selectedPermissions = [];
			role.set('content', this.get('editedRoleName'));
			this.get('editedRolePermissionGroups').forEach((group) => {
				group.get('permissions').forEach((permissionWrapper) => {
					if( permissionWrapper.get('selected') ){
						selectedPermissions.push(permissionWrapper.get('content'));
					}
				});
			});
			role.set('permissions', selectedPermissions);
			var roles = this.get('model.roles');
			if( role.get('isNew')){
				bridgeit.io.admin.createRealmRole({realm: this.get('model.id'), role: role}).then(() => {
					roles.pushObject({
						name: role.get('content'),
						permissions: role.get('permissions')
					});
					Ember.$('#editRoleModal').modal('hide');
				}).catch((error) => {
					alert('Error occurred saving role: ' + error.message);
				});
			}
			else{
				var originalRole = this.get('originalEditedRole');
				return bridgeit.io.admin.updateRealmRole({realm: this.get('model.id'), role: role}).then(() => {
					roles.removeObject(originalRole);
					roles.pushObject(role);
					Ember.$('#editRoleModal').modal('hide');
				}).catch(function(error){
					alert('Error occurred saving role: ' + error.message);
				});
			}
		},

		editRole: function(role){
			this.set('editedRoleName', role.name);
			this.set('editedRole', Role.create(role));
			this.set('originalEditedRole', role);
			var realm = this.get('model');
			var account = realm.get('account');
			var serviceModels = account.get('serviceModels').slice(0);
			var permissionGroups = [];
			var groupedWrappers = {};
			var availablePermissions = serviceModels != null && 
				serviceModels.length > 0 ? serviceModels.map((s) => s.get('permissions')).reduce((prev, curr) => prev.concat(curr)) : [];

			serviceModels.forEach((serviceModel) => {
				var serviceName = serviceModel.get('name');
				var innerWrappers = availablePermissions.filter((p) => p.indexOf(serviceName) === 0)
					.map((p) => Selectable.create({
						content: p, 
						selected: role.permissions.contains(p),
						groupName: p.indexOf('bridgeit') === 0 ? p.split('.')[1] : '',
						label: p.replace(/bridgeit\.[a-zA-Z]+\./i,'')
					}));
				groupedWrappers[serviceName] = innerWrappers;
			});

			permissionGroups.pushObject(
				PermissionGroup.create({
					service: 'bridgeit.user',
					permissions: groupedWrappers['bridgeit.user']
				}));

			permissionGroups.pushObjects(realm.get('sortedServices').map(function(s){
				return PermissionGroup.create({
					service: s,
					permissions: groupedWrappers[s]
				});
			}));
			this.set('editedRolePermissionGroups', permissionGroups);
			Ember.$('#editRoleModal').modal();

		},

		selectAllServicePermissionsForRole: function(s){
			this.get('editedRolePermissionGroups').filter((permissionGroup) => {
				return permissionGroup.get('service') === s;
			}).forEach((permissionGroup) => {
				permissionGroup.get('permissions').forEach((wrapper) => {
					wrapper.set('selected', true);
				});
			});
		},

		deselectAllServicePermissionsForRole: function(s){
			this.get('editedRolePermissionGroups').filter((permissionGroup) => {
				return permissionGroup.get('service') === s;
			}).forEach((permissionGroup) => {
				permissionGroup.get('permissions').forEach((wrapper) => {
					wrapper.set('selected', false);
				});
			});
		},

	}

});


	