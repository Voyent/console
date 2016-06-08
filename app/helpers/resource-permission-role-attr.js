import Ember from 'ember';

export default Ember.Helper.extend({
  compute(params) {
    let prefix = params[0];
    let role = params[1];
    let attr = params[2];
    
    return prefix[role][attr];
  }
});
