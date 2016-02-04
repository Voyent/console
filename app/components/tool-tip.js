import Ember from 'ember';

export default Ember.Component.extend({
	tooltipEvent: 'manual',
	tooltipVisibility: false,

	mouseEnter: function(){
		this.set('tooltipVisibility', true);
	},

	mouseLeave: function(){
		this.set('tooltipVisibility', false);
	},

	click: function(){
		this.toggleProperty('tooltipVisibility');
	}
});