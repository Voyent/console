import BaseModel from './base-model';

export default BaseModel.extend({

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


});