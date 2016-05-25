import Ember from 'ember';
import Selectable from 'console/models/selectable';
import PermissionGroup from 'console/models/permission-group';

export default Ember.Mixin.create({

  onCustomInfoEntry: function(){
    var customInfoInput = this.get('customText');
    var customDocumentValidMsg = '';
    var valid = false;
    if( customInfoInput ){
      try{
        JSON.parse(customInfoInput);
        valid = true;
      }
      catch(e){
        valid = false;
        customDocumentValidMsg = e;
      }
    }
    else{
      valid = true;
    }
    this.set('customDocumentValid', valid);
    this.set('customDocumentValidMsg', customDocumentValidMsg);
    
  }.observes('customText'),

  actions: {

    addNewOriginField: function(){
      this.debug('#addNewOriginField()');
      var origins = this.get('model.editedOriginWrappers').get('selectedValues');
      if( origins.length === 0 ){
        origins = ['*'];
      }
      this.set('model.origins', origins);
      this.get('model.origins').pushObject('');
    },

    removeOriginField: function(wrapper){
      this.get('model.editedOriginWrappers').removeObject(wrapper);
    },

    
  }

});


  