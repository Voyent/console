import Ember from 'ember';
import PermissionRole from 'console/models/permission-role';

var Permission = Ember.Object.extend({

    label: null,
    value: null,
    parent: null,
    selected: false,

    selectedChanged: function(){
        if( this.get('selected') ){
            this.get('parent').addPermission(this.get('value'));
        }
        else{
            this.get('parent').removePermission(this.get('value'));
        }
    }.observes('selected'),

    availableRoles: function(){
        var self = this;
        var permissionString = self.get('value');
        var permissionRoles = this.get('parent').get('roles').map(function(role){
            return PermissionRole.create({
                permission: permissionString,
                role: role,
                selected: role.get('permissions').contains(permissionString)
            });
        });
        return permissionRoles;
    }.property('value', 'parent.roles.@each.content')

});

export default Permission;