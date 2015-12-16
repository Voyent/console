import Ember from 'ember';
var PermissionGroup = Ember.Object.extend({

  service: null,
  collapsed: true,
  permissions: []

});

export default PermissionGroup;