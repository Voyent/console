import Ember from 'ember';

var Service = Ember.Object.extend({

	realm: null,

	//from service
	name: null,
	value: null,
	description: '',
	permissions: [],
	cost: null,

	//from ui
	label: null,
	icon: null,
	serviceCatalog: null,
	
	init: function(){
		var name = this.get('name');
		if( name ){
			this.set('value', name);
		}
	},

	updateServiceSelected: function(){
		var realm = this.get('realm');
		if( realm ){
			this.set('selected', realm.get('services').contains(this.get('value')));
		}
	}.observes('currentRealm'),

	serviceCatalogChanged: function(){
		var serviceCatalog = this.get('serviceCatalog'),
			self = this,
			uiDecorator = serviceCatalog.filter(function(s){
				return s.name === self.get('value');
			})[0];
		if( uiDecorator ){
			this.set('label', uiDecorator.label);
			this.set('icon', uiDecorator.icon);
		}

	}.observes('serviceCatalog'),

	selectedChanged: function(){
		console.log('Service.selectedChanged');
		var realm = this.get('realm');
		if( realm ){
			if( this.get('selected') ){
				this.get('realm').addService(this.get('value'));
			}
			else{
				this.get('realm').removeService(this.get('value'));
			}
		}
	}.observes('selected'),

});

export default Service;
