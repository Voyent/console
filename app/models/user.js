import BaseModel from './base-model';
import Selectable from 'console/models/selectable';
import SelectableArray from 'console/models/selectable-array';

export default BaseModel.extend({

  realm: null,
  currentUser: false,
  isNew: false,

  disabled: false,
  firstname: null,
  lastname: null,
  password: null,
  email: null,
  custom: {},

  //edited properties
  editedCustomTextValid: true,
  editedCustomTextValidMsg: null,
  editedCustomText: null,

  attributeNames: ['username', 'firstname', 'lastname',  'disabled', 'email', 'custom', 'password'],

  id: function(){
    return this.get('username');
  }.property('username'),

  init: function(){
    var custom = this.get('custom');
    if( custom ){
      if( typeof custom === 'string'){
        try{
          this.set('editedCustomText', custom); 
          this.set('custom', JSON.parse(custom));
        }
        catch(e){
          this.warn('WARNING: user model could not parse custom json: ' + custom);
        }
      }
      else{
        try{
          this.set('editedCustomText', JSON.stringify(custom)); 
        }
        catch(e){
          console.error(e);
        }
      }
    }
    var disabled = this.get('disabled');
    if( typeof disabled === 'string'){
      this.set('disabled', disabled === 'true');
    }
  },

  fullname: function() {
    var firstname = this.get('firstname'),
      lastname = this.get('lastname');
    if( !firstname ){
      firstname = '';
    }
    if( !lastname ){
      lastname = '';
    }
    return firstname + ' ' + lastname;
  }.property('firstname', 'lastname'),


  reset: function(){
    var self = this;
    this.setProperties({
      realm: null,
      currentUser: false,
    });
    this.get('nonTransientOwnProperties').forEach(
      function(prop){ 
        self.set(prop, null);
      }
    );
  },

  clone: function(){
    var clonedUser = this.create(
      this.getProperties(this.get('nonTransientOwnProperties'))
    );
    clonedUser.set('realm', this.get('realm'));
    return clonedUser;
  },

  onEditedCustomTextChanged: function(){
    var editedCustomText = this.get('editedCustomText');
    var editedCustomTextValidMsg = '';
    var valid = false;
    if( editedCustomText ){
      try{
        JSON.parse(editedCustomText);
        valid = true;
      }
      catch(e){
        valid = false;
        editedCustomTextValidMsg = e;
      }
    }
    else{
      valid = true;
    }
    this.set('editedCustomTextValid', valid);
    this.set('editedCustomTextValidMsg', editedCustomTextValidMsg);
    
  }.observes('editedCustomText'),

  saveEditedProperties: function(){

    var editedCustomTextValid = this.get('editedCustomTextValid');
    var editedCustomText = this.get('editedCustomText');
    if( editedCustomTextValid && editedCustomText.length > 0){
      this.set('custom', editedCustomText);
    }
    else{
      this.set('custom', "{}");
    }
  },

  serialize: function(){
    return this.getProperties(this.get('attributeNames'));
  },

  customJSON: function(){
    var custom = this.get('custom');
    var customJSON;
    if( typeof custom === 'string'){
      try{
        customJSON = JSON.parse(custom);
      }
      catch(e){
        customJSON = {};
      }
    }
    else if( typeof custom === 'object'){
      customJSON = custom;
    }
    else{
      customJSON = {};
    }
    return customJSON;
  }.property('custom'),


});