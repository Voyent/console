import Ember from 'ember';
import BaseModel from './base-model';

export default BaseModel.extend({

  service: null,
  collapsed: true,
  permissions: [],

  allPermissionsSelected: function(){
  	var permissions = this.get('permissions');
  	var l = permissions.filter((p) => p.get('selected')).length;
  	return l === permissions.length;
  }.property('permissions.@each.selected')

});