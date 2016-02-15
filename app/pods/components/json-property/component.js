import Ember from 'ember';

export default Ember.Component.extend({

  tagName: 'li',
  
  node: null,

  actions: {

    remove: function(node){
      var parent = node.get('parent');
      if( parent ){
        parent.get('children').removeObject(node);
      }
    },
  }

});