import Ember from 'ember';
import BaseModel from './base-model';

export default BaseModel.extend({

  role: null,
  permission: null,
  selected: false,

  selectedChanged: function(){
    var role = this.get('role');
    var permission = this.get('permission');
    if( this.get('selected') && !role.get('permissions').contains(permission)){
      role.get('permissions').pushObject(permission);
    }
    else{
      role.get('permissions').removeObject(permission);
    }
  }.observes('selected'),

});