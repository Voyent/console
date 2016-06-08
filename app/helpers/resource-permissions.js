import Ember from 'ember';

export default Ember.Helper.extend({
  compute(params) {
    let resourcePermissions = params[0];
    let target = params[1];
    let permission = params[2];
    let role = params[3];

    if( resourcePermissions ){
    	let right = resourcePermissions.rights[target];
    	if( right ){
    		if( role ){
    			return right[role].indexOf(permission) > -1;
    		}
    		else{
    			return right.indexOf(permission) > -1;
    		}
    	}
    }
  }
});
