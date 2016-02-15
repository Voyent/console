import Ember from 'ember';
import JsonNode from 'console/pods/components/json-node/json-node';

export default Ember.Route.extend({

	setupController: function(controller, model){
		this._super(controller, model);

		//create json node model for optional info
		var custom = model.get('custom');
		var json;
		if( custom ){
			if( typeof custom === 'object'){
				json = custom;
			}
			else if( typeof custom === 'string'){
				try{
					json = JSON.parse(custom);
				}
				catch(e){
					json = {};
				}
			}
		}
		else{
			json = {};
		}
		var node = processNode(null, json);
		controller.set('editedOptionalInformation', node);
		
		function processNode(key, value, parent){
			var node = JsonNode.create({key: key, parent: parent});
			if( typeof value === 'object'){
				node.set('isProperty', false);
				var props = _.without(Object.getOwnPropertyNames(value), '__ember_meta__');
				props.forEach((p) => {
					node.get('children').pushObject(processNode(p, value[p], value));
				});
			}
			else{
				node.set('isProperty', true);
				node.set('value', value);
			}
			return node;
		}
	}
});
