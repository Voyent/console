import Selectable from 'console/models/selectable';
import SelectableArray from 'console/models/selectable-array';
import PermissionGroup from 'console/models/permission-group';
import BaseModel from './base-model';

export default BaseModel.extend({

  id: function(){
    return this.get('name');
  }.property('name'),

  attributeNames: ['name', 'description', 'services', 'origins', 'users', 'quick_user', 'disabled', 'custom', 'roles'],

  //attributes
  name: '',
  origins: ['*'],
  services: [],
  users: [],
  roles: [],
  quick_user: false,
  disabled: false,
  custom: {},
  account: null,

  documents: [],
  collections: [],
  collection:'documents',
  //edited properties
  editedCustomTextValid: true,
  editedCustomTextValidMsg: null,
  editedCustomText: null,
  createTestUsers: true,

  init: function(){
    var custom = this.get('custom');
    if( custom ){
      if( typeof custom === 'string'){
        try{
          this.set('custom', JSON.parse(custom));
        }
        catch(e){
          this.warn('WARNING: realm model could not parse custom json', custom);
        }
      }
      else{
        try{
          this.set('editedCustomText', JSON.stringify(custom));
        }
        catch(e){
          console.error(e);
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

  getAvailablePermissionGroups: function(){
    var serviceModels = this.get('account.serviceModels').slice(0);
    var selectedServices = this.get('services');
    var permissionGroups = [];
    var groupedWrappers = {};
    var availableServiceModels = serviceModels.filter((s) => selectedServices.contains(s.name) || s.name === 'services.user');
    var availablePermissions = availableServiceModels != null &&
      availableServiceModels.length > 0 ? availableServiceModels.map((s) => s.get('permissions'))
      .reduce( (prev, curr) => prev.concat(curr) ) : [];

    serviceModels.forEach((sm) => {
      var serviceName = sm.get('name');
      //TODO Check below
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
        service: 'services.user',
        permissions: groupedWrappers['services.user']
      }));

    permissionGroups.pushObjects(selectedServices.map((s) => {
      return PermissionGroup.create({
        service: s,
        permissions: groupedWrappers[s]
      });
    }));
    return permissionGroups;
  },

  saveEditedProperties: function(){

    this.set('services', this.get('editedServiceWrappers').get('selectedValues').map((w) => w.get('name')));

    var origins = this.get('editedOriginWrappers').get('selectedValues');
    if( origins.length === 0 ){
      origins = ['*'];
    }
    this.set('origins', origins);

    var editedCustomTextValid = this.get('editedCustomTextValid');
    var editedCustomText = this.get('editedCustomText');
    if( editedCustomTextValid && editedCustomText.length > 0){
      this.set('custom', editedCustomText);
    }
    else{
      this.set('custom', "{}");
    }
  },

  serialize: function(){
    return this.getProperties('name', 'description', 'services', 'origins', 'quick_user', 'disabled', 'custom', 'roles');
  },

  onEditedCustomTextChanged: function(){
    var editedCustomText = this.get('editedCustomText');
    var editedCustomTextValidMsg = '';
    var valid = false;
    if( editedCustomText ){
      try{
        JSON.parse(editedCustomText);
        valid = true;
      }
      catch(e){
        valid = false;
        editedCustomTextValidMsg = e;
      }
    }
    else{
      valid = true;
    }
    this.set('editedCustomTextValid', valid);
    this.set('editedCustomTextValidMsg', editedCustomTextValidMsg);

  }.observes('editedCustomText'),

  editedOriginWrappers: function(){
    var origins = this.get('origins');
    var editedOriginWrappers = SelectableArray.create({content: []});
    if( origins && !!origins.length ){
      editedOriginWrappers.pushObjects(origins.map((origin) => Selectable.create({value: origin, selected: true})));
    }
    else{
      editedOriginWrappers.pushObject(Selectable.create({value: '', selected: true}));
    }
    return editedOriginWrappers;

  }.property('origins.[]'),

  editedServiceWrappers: function(){
    var account = this.get('account');
    var accountServiceModels = account.get('sortedServiceModels').filter((sm) => sm.name !== 'services.user');
    var editedServiceWrappers = SelectableArray.create({content: []});
    if( accountServiceModels ){
      editedServiceWrappers.pushObjects(accountServiceModels.filter((w) => w.get('value') !== 'services.auth').map( (w) => {
        var selectable = Selectable.create({value: w});
        if( this.get('services').contains(selectable.get('value.name')) ){
          selectable.set('selected', true);
        }
        return selectable;
      }));
    }
    return editedServiceWrappers;
  }.property('services.[]'),

  selectedServiceWrappers: function(){
    var account = this.get('account');
    var accountServiceModels = account.get('sortedServiceModels').filter((sm) => sm.name !== 'services.user');
    var selectedServiceWrappers = [];
    var selectedServices = this.get('services');
    if( accountServiceModels ){
      selectedServiceWrappers = accountServiceModels.filter((w) => selectedServices.indexOf(w.get('value')) > -1 );
    }
    return selectedServiceWrappers;
  }.property('services.[]'),

  editedRoleWrappers: function(){
    var roles = this.get('roles');
    var editedRoleWrappers = SelectableArray.create({content: []});
    if( roles && !!roles.length ){
      editedRoleWrappers.pushObjects(roles.map((r) => Selectable.create({value: r, selected: true})));
    }
    return editedRoleWrappers;
  },

  generateTestUsersForServices: function(services){
    var testUsers = [];
    var account = this.get('account');
    this.get('account.serviceModels').forEach((serviceModel) => {
      var name = serviceModel.name;
      if( name && services.indexOf(name) > -1 ){
        //TODO: Check permission below
        if( name === 'services.push' ){
          testUsers['services.push'] = [
            {username: 'TEST_PUSH_ADMIN', firstname: 'TEST', lastname: 'PUSH_ADMIN',
              password: 'testtest', permissions: account.getServiceModel('services.push').get('permissions')},
            {username: 'TEST_PUSH_USER', firstname: 'TEST', lastname: 'PUSH_USER',
              password: 'testtest', permissions: ['bridgeit.push.listen']},
          ];
        }
        else{
          var service = name.replace('services.','').toUpperCase();
          testUsers[serviceModel.name] = [{
            username: 'TEST_' + service + '_USER',
            firstname: 'TEST',
            lastname: service + '_USER',
            password: 'testtest',
            permissions: serviceModel.get('permissions')
          }];
        }
      }
    });
    return testUsers;
  },

  getRole: function(roleName){
    var f = this.get('roles').filter((r) => r.name === roleName);
    return f.length ? f[0] : null;
  },

  customJSON: function(){
    var custom = this.get('custom');
    var customJSON;
    if( typeof custom === 'string'){
      try{
        customJSON = JSON.parse(custom);
      }
      catch(e){
        customJSON = {};
      }
    }
    else if( typeof custom === 'object'){
      customJSON = custom;
    }
    else{
      customJSON = {};
    }
    return customJSON;
  }.property('custom'),

  hasService: function(service){
    return this.get('services').indexOf(service) > -1;
  },

  hasDocumentsService: function(){

    return this.hasService('doc.service');
  }.property('services.[]'),

  hasActionService: function(){
    return this.hasService('action.service');
  }.property('services.[]'),

  hasEventHubService: function(){
    return this.hasService('eventhub.service');
  }.property('services.[]'),

  hasLocationService: function(){
    return this.hasService('locate.service');
  }.property('services.[]'),

  hasQueryService: function(){
    return this.hasService('query.service');
  }.property('services.[]'),

  hasStorageService: function(){
    return this.hasService('store.service');
  }.property('services.[]'),

  hasMailboxService: function(){
    return this.hasService('mailbox.service');
  }.property('services.[]'),

  hasPushService: function(){
    return this.hasService('push.service');
  }.property('services.[]')

});
