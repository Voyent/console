import Ember from 'ember';
import Realm from 'console/models/realm';

export default Ember.Route.extend({

  model: function(){
    var account = this.controllerFor('application').get('account');
    var realm = Realm.create({account: account});
    return realm;
  },

  setupController: function(controller, context) {
    this._super(controller, context);
    controller.send('reset');
    setupTestUsers(this, controller);

    function setupTestUsers(route, controller){
      var account = route.controllerFor('application').get('account');
      var testUsers = {};

      account.get('serviceModels').forEach( function(serviceModel){
        var name = serviceModel.name;
        if( name ){
          if( name === 'services.push' ){
            testUsers['services.push'] = [
              {username: 'TEST_PUSH_ADMIN', firstname: 'TEST', lastname: 'PUSH_ADMIN',
                password: 'testtest', permissions: account.getServiceModel('services.push').get('permissions')},
              {username: 'TEST_PUSH_USER', firstname: 'TEST', lastname: 'PUSH_USER',
                password: 'testtest', permissions: ['bridgeit.push.listen']},
            ];
          }
          else{
            var service = name.replace('services.','').toUpperCase();
            testUsers[serviceModel.name] = [{
              username: 'TEST_' + service + '_USER',
              firstname: 'TEST',
              lastname: service + '_USER',
              password: 'testtest',
              permissions: serviceModel.get('permissions')},
            ];
          }
        }
      });
      controller.set('testUsers', testUsers);
    }
  },

});
