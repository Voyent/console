import Ember from 'ember';
import Selectable from 'console/models/selectable';
import Origin from 'console/models/origin';
import PermissionGroup from 'console/models/permission-group';

var Realm = Ember.Object.extend({

	id: function(){
		return this.get('name');
	}.property('name'),

	name: '',
	origins: [],
	services: [],
	roles: [],
	users: [],
	quick_user: false,
	disabled: false,
	custom: {},
	customText: '{}',

	nonTransientOwnProperties: ['name', 'description', 'services', 'origins', 'users', 'quick_user', 'disabled', 'custom', 'roles'],

	init: function(){
		var custom = this.get('custom');
		if( custom ){
			this.set('customText', JSON.stringify(custom));	
			if( typeof custom === 'string'){
				try{
					this.set('custom', JSON.parse(custom));
				}
				catch(e){
					console.log('WARNING: realm model could not parse custom json: ' + custom);
				}
			}
		}

		var disabled = this.get('disabled');
		if( typeof disabled === 'string'){
			this.set('disabled', disabled === 'true');
		}

		var quickUser = this.get('quick_user');
		if( typeof quickUser === 'string'){
			this.set('quick_user', quickUser === 'true');
		}
	},

	sortedServices: function(){
		return this.get('services').sort();
	}.property('services.[]'),

	availableServiceWrappers: function(){
		var account = this.get('account');
		var accountServiceModels = account.get('sortedServiceModels').filter((sm) => sm.name !== 'bridgeit.user');
		var availableServiceWrappers = [];
		if( accountServiceModels ){
			availableServiceWrappers = accountServiceModels.filter((w) => w.get('value') !== 'bridgeit.auth')
				.map( (w) => {
					var selectable = Selectable.create({content: w});
					selectable.set('realm', this);
					if( this.get('services').contains(selectable.get('value')) ){
						selectable.set('selected', true);
					}
					return selectable;
				});
		}
		return availableServiceWrappers;
	}.property('services.[]'),

	selectedServices: function(){
		return this.get('availableServiceWrappers').filter((w) => w.get('selected')).map((w) => w.get('content.value'));
	}.property('availableServiceWrappers.@each.selected'),

	originWrappers: function(){
		var origins = this.get('origins');
		if( origins && !!origins.length ){
			return this.get('origins').map((origin) => Origin.create({url: origin}));
		}
		else{
			return [Origin.create({url: ''})];
		}
		
	}.property('origins.[]'),

	getAvailablePermissionGroups: function(){
		var serviceModels = this.get('account.serviceModels').slice(0);
		var selectedServices = this.get('selectedServices');
		var permissionGroups = [];
		var groupedWrappers = {};
		var availableServiceModels = serviceModels.filter((s) => selectedServices.contains(s.name) || s.name === 'bridgeit.user');
		var availablePermissions = availableServiceModels != null && 
			availableServiceModels.length > 0 ? availableServiceModels.map((s) => s.get('permissions'))
			.reduce( (prev, curr) => prev.concat(curr) ) : [];

		serviceModels.forEach((sm) => {
			var serviceName = sm.get('name');
			var innerWrappers = availablePermissions.filter((p) => p.indexOf(serviceName) === 0)
				.map((p) => Selectable.create({
					content: p, 
					selected: false,
					groupName: p.indexOf('bridgeit') === 0 ? p.split('.')[1] : '',
					label: p.replace(/bridgeit\.[a-zA-Z]+\./i,'')
				}));
			groupedWrappers[serviceName] = innerWrappers;
		});

		permissionGroups.pushObject(
			PermissionGroup.create({
				service: 'bridgeit.user',
				permissions: groupedWrappers['bridgeit.user']
			}));

		permissionGroups.pushObjects(selectedServices.map((s) => {
			return PermissionGroup.create({
				service: s,
				permissions: groupedWrappers[s]
			});
		}));
		return permissionGroups;
	}

	
});

export default Realm;
