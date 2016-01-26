import BaseModel from './base-model';
import User from 'console/models/user';
import Realm from 'console/models/realm';
import Service from 'console/models/service';
import serviceCatalog from 'console/service-catalog';

var Account = BaseModel.extend({

  id: function(){
    return this.get('accountname');
  }.property('name'),

  accountname: '',
  description: '',
  admins: [],
  realms: [],
  serviceModels: [],

  init: function() {
    var self = this;
    this.set('admins', this.get('admins').map(function(admin){
      var adminModel = User.create(admin);
      adminModel.set('account', self);
      return adminModel;
    }));
    this.set('realms', this.get('realms').map(function(realm){
      var realmModel = Realm.create(realm);
      return realmModel;
    }));
  },

  setCurrentUser: function(currentUser){
    this.set('admins', this.get('admins').map(function(admin){
      if( admin.username === currentUser ){
        admin.set('currentUser', true);
      }
      return admin;
    }));
  },

  getCurrentServices: function(){
    var services = [];
    this.get('realms').forEach(function(realm){
      services = services.concat(realm.get('services').filter(function(s){
        return !services.contains(s);
      }));
    });
    return services;
  }.property('realms'),

  getAdmin: function(username){
    var arr = this.get('admins').filter(function(admin){
      return admin.get('username') === username;
    });
    return arr && arr.length === 1 ? arr[0] : null;
  },

  getServiceModel: function(name){
    var arr = this.get('serviceModels').filter(
      function(s){
        return s.get('name') === name;
      });
    return arr.length === 1 ? arr[0] : null;
  },

  serviceModelsChanged: function(){
    var self = this;
    this.get('realms').forEach(function(r){
      r.set('account', self);
    });

  }.observes('serviceModels'),

  getRealm: function(realmName){
    var list = this.get('realms').filter(
      function(r){
        return r.get('name') === realmName;
      }
    );
    return list.length === 1 ? list[0] : null;
  },

  loadServiceModels: function(payload){
    var servicesToFilter = ['bridgeit.starter'];
    if( payload && payload.services ){
      var serviceModels = payload.services.filter((s) => {
        if( s.name === 'bridgeit.auth'){
          this.set('authPermissions', s.permissions);
        }
        return s.name && !servicesToFilter.contains(s.name);
      }).map((s) => {
        var service = Service.create(s);
        service.set('serviceCatalog', serviceCatalog);
        return service;
      });
      serviceModels.pushObject( Service.create({
        name: 'bridgeit.user',
        permissions: [
          'bridgeit.user.editUser',
          'bridgeit.user.viewUser',
          'bridgeit.user.deleteUser',
          'bridgeit.user.viewOther',
          'bridgeit.user.editOther',
          'bridgeit.user.deleteOther'],
        description: 'The BridgeIt Authorization and Authentication service'
      }));
      this.set('serviceModels', serviceModels);
    }
  },

  sortedServiceModels: function(){
    return this.get('serviceModels').sortBy('name');
  }.property('serviceModels.[]')



});

export default Account;
