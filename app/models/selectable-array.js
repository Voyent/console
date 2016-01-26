import Ember from 'ember';

export default Ember.ArrayProxy.extend({

  selectedValues: function(){
    return this.filter((w) => w.get('selected')).map((w) => w.get('value'));
  }.property('this.@each.value', 'this.@each.selected')

});
