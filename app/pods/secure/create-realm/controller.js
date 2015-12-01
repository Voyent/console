import BaseController from 'admin/controllers/base-controller';
import RealmMixin from 'admin/controllers/realm-mixin';
//import validation from 'admin/helpers/bridgeit-validation';
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
