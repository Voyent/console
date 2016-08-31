import Ember from 'ember';
import Realm from 'console/models/realm';

export default Ember.Route.extend({

  model: function(params) {
    var appController = this.controllerFor('application');
    var account = appController.get('account');
    var realms = account.get('realms');
    var realm = Realm.create(realms.filter( r => r.name === params.realm_id )[0]);

    let promises = [];

    if( realm.get('hasDocumentsService')){
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.documents.findDocuments({realm: realm.get('id')}).then((documents) => {
          realm.set('documents', documents);
        });
      }));
    }

    if( realm.get('hasActionService')){
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.action.findActions({
          realm: realm.get('id')
        }).then((actions) => {
          realm.set('actions', actions);
        });
      }));
    }

    if( realm.get('hasEventHubService')){
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.eventhub.findHandlers({
          realm: realm.get('id')
        }).then((handlers) => {
          realm.set('handlers', handlers);
        });
      }));
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.eventhub.findRecognizers({
          realm: realm.get('id')
        }).then((recognizers) => {
          realm.set('recognizers', recognizers);
        });
      }));
    }

    if( realm.get('hasLocationService')){
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.location.getAllRegions({
          realm: realm.get('id')
        }).then((regions) => {
          realm.set('regions', regions);
        });
      }));
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.location.getAllPOIs({
          realm: realm.get('id')
        }).then((pois) => {
          realm.set('pois', pois);
        });
      }));
    }

    if( realm.get('hasQueryService')){
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.query.findQueries({
          realm: realm.get('id')
        }).then((queries) => {
          realm.set('queries', queries);
        });
      }));
    }

    if( realm.get('hasMailboxService')){
      //don't show anything for mailbox service
      //since there could be a massive amount of
      //messages and they cannot be updated anyway
      /*promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.mailbox.findMailboxes({
          realm: realm.get('id')
        }).then((mailboxes) => {
          realm.set('mailboxes', mailboxes);
        });
      }));*/
    }

    if( realm.get('hasStorageService')){
      promises.push(Ember.RSVP.Promise.resolve().then(() => {
        return voyent.io.storage.getMetaInfo({
          realm: realm.get('id')
        }).then((blobs) => {
          realm.set('blobs', blobs);
        });
      }));
    }

    return Ember.RSVP.Promise.all(promises).then(() => {
      return realm;
    });
  },

  afterModel: function(model){
  	voyent.io.setCurrentRealm(model.get('name'));
  },

  deactivate: function(){
  	voyent.io.setCurrentRealm('admin');
  }

});
