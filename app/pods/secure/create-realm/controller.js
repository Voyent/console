import BaseController from 'console/controllers/base-controller';
import RealmMixin from 'console/controllers/realm-mixin';
//import validation from 'console/helpers/bridgeit-validation';
//import Ember from 'ember';

export default BaseController.extend( RealmMixin, {

  createTestUsers: true,
  testUsers: null,
 
  actions: {
    cancel: function(){
      this.transitionToRoute('secure.index');
    },
    
    
  }

});
