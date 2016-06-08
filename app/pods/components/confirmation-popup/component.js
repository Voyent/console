import Ember from 'ember';

export default Ember.Component.extend({

	confirmationLabel: 'Yes',
	denyLabel: 'No',
	title: 'Please Confirm',
	text: 'Are you sure?',

	openPopup: function(){
		Ember.$('#confirmationModal').modal();
	},

	closePopup: function(){
		Ember.$('#confirmationModal').modal('hide');
	},

	didInsertElement: function(){
		console.log('confirmation-popup.didInsertElement()');
		this.openPopup();
	},
	
	actions: {
		confirm: function(){
			this.closePopup();
			this.sendAction('onconfirm');
		},

		deny: function(){
			this.closePopup();
			this.sendAction('ondeny');
		}
	}
});