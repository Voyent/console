import Ember from 'ember';

var Selectable = Ember.ObjectProxy.extend({

  selected: false,
  value: null

});

export default Selectable;