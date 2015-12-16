import Ember from 'ember';
import Selectable from 'console/models/selectable';

var User = Ember.Object.extend({

  realm: null,
  currentUser: false,
  isNew: false,

  disabled: false,
  roles: [],
  firstname: null,
  lastname: null,
  password: null,
  email: null,
  custom: {},
  customText: '{}',

  nonTransientOwnProperties: ['username', 'firstname', 'lastname',  'disabled', 'email', 'custom', 'password', 'roles'],

  id: function(){
    return this.get('username');
  }.property('username'),

  init: function(){
    var custom = this.get('custom');
    if( custom ){
      this.set('customText', JSON.stringify(custom)); 
      if( typeof custom === 'string'){
        try{
          this.set('custom', JSON.parse(custom));
        }
        catch(e){
          console.log('WARNING: user model could not parse custom json: ' + custom);
        }
      }
    }
    var disabled = this.get('disabled');
    if( typeof disabled === 'string'){
      this.set('disabled', disabled === 'true');
    }
  },

  fullname: function() {
    var firstname = this.get('firstname'),
      lastname = this.get('lastname');
    if( !firstname ){
      firstname = '';
    }
    if( !lastname ){
      lastname = '';
    }
    return firstname + ' ' + lastname;
  }.property('firstname', 'lastname'),


  reset: function(){
    var self = this;
    this.setProperties({
      realm: null,
      currentUser: false,
    });
    this.get('nonTransientOwnProperties').forEach(
      function(prop){ 
        self.set(prop, null);
      }
    );
  },

  clone: function(){
    var clonedUser = User.create(
      this.getProperties(this.get('nonTransientOwnProperties'))
    );
    clonedUser.set('realm', this.get('realm'));
    return clonedUser;
  },

  customChanged: function(){
    var custom = this.get('custom');
    this.set('customText', JSON.stringify(custom));
  }.observes('custom'),

  addRole: function(role){
    var roles = this.get('roles');
    if( roles.indexOf(role) === -1 ){
      roles.pushObject(role);
    }
  },

  removeRole: function(role){
    var roles = this.get('roles');
    if( roles.indexOf(role) > -1 ){
      roles.removeObject(role);
    }
  },

  roleWrappers: function(){
    var realmRoles = this.get('realm.roles');
    var myRoles = this.get('roles');
    if( realmRoles ){
      return realmRoles.map((role) => Selectable.create({
          content: role.name,
          selected: myRoles.indexOf(role.name) > -1 
      }));
    }
    else{
      return [];
    }
    
  }.property('realm.roles.[]', 'roles.[]')

});

export default User;
