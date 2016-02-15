import Ember from 'ember';
import JsonNode from './json-node';
import JsonProperty from '../json-property/json-property';

export default Ember.Component.extend({

  tagName: 'ul',
  classNames: 'optional-info',

  node: null,

  actions: {

    addChildProperty: function(node){
      node.get('children').pushObject(JsonProperty.create({parent: node, isProperty: true}));
      this.set('collapsed', false);
    },

    addChildNode: function(node){
      node.get('children').pushObject(JsonNode.create({parent: node, isProperty: false, children: []}));
      this.set('collapsed', false);
    },

    remove: function(node){
      var parent = node.get('parent');
      if( parent ){
        parent.get('children').removeObject(node);
      }
    },

    toggleCollapsed: function(){
      this.toggleProperty('collapsed');
    }
  }

});