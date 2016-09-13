import Ember from 'ember';
import Selectable from 'console/models/selectable';
import Role from 'console/models/role';
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
      this.debug('#addNewOriginField()');
      var origins = this.get('model.editedOriginWrappers').get('selectedValues');
      if( origins.length === 0 ){
        origins = ['*'];
      }
      this.set('model.origins', origins);
      this.get('model.origins').pushObject('');
    },

    removeOriginField: function(wrapper){
      this.get('model.editedOriginWrappers').removeObject(wrapper);
    },

    addNewRole: function(){
      this.debug('#addNewRole()');
      var realm = this.get('model');
      this.set('editedRole', Role.create({isNew: true}));
      this.set('editedRoleName', '');
      this.set('editedRolePermissionGroups', realm.getAvailablePermissionGroups());
      Ember.$('#editRoleModal').modal();
    },

    cancelEditedRole: function(){
      console.log('Edited Role');
      console.log(this.get('editedRole'));
      console.log('Permission Groups');
      console.log(this.get('editedRolePermissionGroups'));
      this.set('editedRole', null);
      this.set('editedRoleName', null);
      this.set('editedRolePermissionGroups', []);
      Ember.$('#editRoleModal').modal('hide');
    },

    saveEditedRole: function(){
      this.debug('saveEditedRole()');
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
        voyent.io.admin.createRealmRole({realm: this.get('model.id'), role: role}).then(() => {
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
        return voyent.io.admin.updateRealmRole({realm: this.get('model.id'), role: role}).then(() => {
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
        //TODO: Check below
        var innerWrappers = availablePermissions.filter((p) => p.indexOf(serviceName) === 0)
          .map((p) => Selectable.create({
            content: p,
            selected: role.permissions ? role.permissions.contains(p) : false,
            groupName: p.indexOf('services') === 0 ? p.split('.')[1] : '',
            label: p.replace(/services\.[a-zA-Z]+\./i,'')
          }));
        groupedWrappers[serviceName] = innerWrappers;
      });

      permissionGroups.pushObject(
        PermissionGroup.create({
          service: 'services.user',
          permissions: groupedWrappers['services.user']
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

    confirmDeleteRole: function(role){
      this.set('selectedRole', role);
      Ember.$('#confirmDeleteRoleModal').modal();
    },

    deleteRole: function(){
      var roleName = this.get('selectedRole.name');
      var role = this.get('model').getRole(roleName);
      if( !role ){
        this.get('application').showErrorMessage('Could not file role ' + roleName);
        return;
      }
      Ember.$('#confirmDeleteRoleModal').modal('hide');
      voyent.io.admin.deleteRealmRole({
        id: roleName
      }).then(() => {
        this.get('application').showInfoMessage('Deleted role ' + roleName);
        this.get('model.roles').removeObject(role);
      }).catch((error) => {
        this.get('application').showErrorMessage(error, 'Error deleting role');
        this.error('Error deleting role', error);
      });
    },

    cancelDeleteRole: function(){
      this.set('selectedRole', null);
      Ember.$('#confirmDeleteRoleModal').modal('hide');
    }
  }

});


