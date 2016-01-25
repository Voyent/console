import Ember from 'ember';

export default Ember.Route.extend({

	setupController: function(controller, context) {
        controller.send('reset');
        var loginController = this.controllerFor('login');
        if( loginController ){
            controller.set('username', loginController.get('username'));
            controller.set('password', loginController.get('password'));
        }
    }
    
});
