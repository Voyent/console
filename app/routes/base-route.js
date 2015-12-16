import Ember from 'ember';

export default Ember.Route.extend({

  afterModel: function(){
    this.controllerFor('application').set('loading', false);
  },

  deactivate: function(){
    this.get('controller').send('reset');
  },

  actions: {
    loading: function() {
      this.controllerFor('application').set('loading', true);
      return true;
    },
    error: function(err){
      console.error(err);
      this.controllerFor('application').set('loading', false);
      
    }
  }

  
});
