import Ember from 'ember';

export default Ember.Component.extend({
	
	resource: null,
	editedResourceStr: null,
	editing: false,
	error: null,
	valid: true,
	validationMsg: null,
	newResourceId: null,
	service: null,
	path: null,
	isnew: false,

	open: function(){
		Ember.$('#showResourceModal').modal();
	},	

	edit: function(){
		this.set('editing', true);
		let editedResourceStr = JSON.stringify(this.get('resource'), null, 3);
		this.set('editedResourceStr', editedResourceStr);
	},

	close: function(){
		Ember.$('#showResourceModal').modal('hide');
		this.sendAction('onclose');
	},

	didInsertElement: function(){
		console.log('resource-popup.didInsertElement()');
		this.open();
		if( this.get('editing')){
			this.edit();
		}
	},

	editedResourceStrChanged: function(){
		var input = this.get('editedResourceStr');
		try{
			JSON.parse(input);
			this.set('valid', true);
			this.set('validationMsg', '');
		}
		catch(e){
			this.set('valid', false);
			this.set('validationMsg', e);
		}
	}.observes('editedResourceStr'),

	actions: {
		close: function(){
			this.close();
		},

		edit: function(){
			this.edit();
		},

		cancelEdit: function(){
			this.set('editing', false);
			this.set('editedResourceStr', null);
			this.set('newResourceId', null);
			if( this.get('isnew')){
				this.close();
			}
		},

		save: function(){
			if( this.get('editing') && this.get('valid')){
				let editedResourceStr = this.get('editedResourceStr');
				let editedResource = JSON.parse(editedResourceStr);
				let validationCallback = this.get('validate');
				let service = this.get('service');
				let newResourceId = this.get('newResourceId');
				
				//if client has set a validate callback, execute it, otherwise proceed
				if( !validationCallback || validationCallback(editedResource, newResourceId, service, this.get('path'))){
					this.sendAction('onsave', editedResource, newResourceId); 
					this.set('resource', editedResource);
					this.set('editedResourceStr', null);
					this.set('editing', false);
					this.set('newResourceId', null);
					this.set('isnew', false);
				}
			}
		},

		delete: function(){
			this.sendAction('ondelete', this.get('resource'));
		}
	}
});