import Ember from 'ember';

export default Ember.Helper.extend({
  compute(params) {
    var list = params[0];
    var delim = params.length && params[1] || ', ';
    if( list ){
      return list.join(delim);
    }
  }
});
