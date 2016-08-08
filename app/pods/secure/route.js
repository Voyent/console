import BaseRoute from 'console/routes/base-route';

export default BaseRoute.extend({
	beforeModel: function(){
		if( !voyent.io.auth.isLoggedIn()){
			this.info('unauthorized, transitioning to index');
			this.transitionTo('index');
		}
		else{
			window.addEventListener('voyent-session-expired', (e) => {
				console.log('console app received event voyent-session-expired', e);
				this.transitionTo('index');
			});
		}
	}
});
