import BaseRoute from 'console/routes/base-route';

export default BaseRoute.extend({
	beforeModel: function(){
		if( !bridgeit.io.auth.isLoggedIn()){
			this.info('unauthorized, transitioning to index');
			this.transitionTo('index');
		}
	}
});
