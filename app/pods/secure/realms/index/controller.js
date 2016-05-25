import Ember from 'ember';
import BaseController from 'console/controllers/base-controller';
import RealmMixin from 'console/controllers/realm-mixin';

//import Ember from 'ember';

export default BaseController.extend( RealmMixin, {

	//TODO show custom json object as property list

	showCloneRealmPopup: false,
	cloneRealmMsg: null,
	application: Ember.inject.controller(),
	cloneRealmLog: null,
	cloneRealmInProcess: false,

	openConfirmDeleteRealmPopup: function() {
		Ember.$('#deleteRealmModal').modal();
	},

	closeDeleteRealmPopup: function() {
		Ember.$('#deleteRealmModal').modal('hide');
	},

	actions: {
		
		openCloneRealmPopup: function() {
			this.set('showCloneRealmPopup', true);
			Ember.$('#cloneRealmModal').modal();
			setTimeout(() => {
				Ember.$('#newCloneRealmName').focus();
			},200);
		},

		closeCloneRealmPopup: function(){
			this.set('showCloneRealmPopup', false);
			Ember.$('#cloneRealmModal').modal("hide");
		},

		cloneRealmDialog: function(){
			this.send('openCloneRealmPopup');
		},

		cancelCloneRealm: function(){
			this.set('selectedRealm', null);
			this.send('closeCloneRealmPopup');
		},

		confirmDeleteRealm: function(){
			this.openConfirmDeleteRealmPopup();
		},

		cancelDeleteRealm: function(){
			this.closeDeleteRealmPopup();
		},

		deleteRealmConfirmed: function(){
			this.closeDeleteRealmPopup();

			var realm = this.get('model');
			var account = this.get('application.account');

			return bridgeit.io.admin.deleteRealm({realmName: realm.get('id')}).then(() => {
				
				//set the account on the realm so it has access to parent properties
				realm.set('account', account);

				//remove deleted realm from account.realms
				var realms = account.get('realms').filter((r) => r.get('id') !== realm.get('id'));
				account.set('realms', realms); 
				this.transitionToRoute('secure.index');
			});
		},
		
		cloneRealm: function(){

			var log = function log(msg){
				_log = msg + "\n" + _log;
				self.set('cloneRealmLog', _log);
			};

			var _log = '';
			var self = this;
			this.set('cloneRealmInProcess', true);
			var newRealmName = this.get('newCloneRealmName');
			var realm = this.get('model');
			var oldRealmName = realm.get('id');
			log("Starting clone realm process");

			
			//admin.cloneRealm() will only clone basic info
			return bridgeit.io.admin.cloneRealm({originRealmName: realm.get('id'), destRealmName: newRealmName}).then((clonedRealmURI) => {
				log('created newly cloned realm with basic info: ' + clonedRealmURI);

				//clone all POIs
				log('fetching location service POIs');
				return bridgeit.io.location.getAllPOIs({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching POIs: ' + err.responseText);
				});

			}).then((pois) => {

				var poiPromises = [];
				if( pois ){
					log('cloning ' + pois.length + ' POIs');
					pois.forEach((poi) => {
						poiPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return bridgeit.io.location.createPOI({
								realm: newRealmName,
								poi: poi
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(poiPromises);

			}).then(() => {
				log('completed cloning POIs');

				//clone all regions
				log('fetching location service regions');
				return bridgeit.io.location.findRegions({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching regions: ' + err.responseText);
				});

			}).then((regions) => {

				var regionPromises = [];
				if( regions ){
					log('cloning ' + regions.length + ' regions');
					regions.forEach((region) => {
						regionPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return bridgeit.io.location.createRegion({
								realm: newRealmName,
								region: region
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(regionPromises);

			}).then(() => {
				log('completed cloning regions');

				//clone all monitors
				log('fetching location service monitors');
				return bridgeit.io.location.findMonitors({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching monitors: ' + err.responseText);
				});

			}).then((monitors) => {

				var monitorPromises = [];
				if( monitors ){
					log('cloning ' + monitors.length + ' monitors');
					monitors.forEach((monitor) => {
						monitorPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return bridgeit.io.location.createMonitor({
								realm: newRealmName,
								monitor: monitor
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(monitorPromises);

			}).then(() => {
				log('completed cloning monitors');

				//actions
				log('fetching action service actions');
				return bridgeit.io.action.findActions({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching actions: ' + err.responseText);
				});

			}).then((actions) => {

				var actionPromises = [];
				if( actions ){
					log('cloning ' + actions.length + ' actions');
					actions.forEach((action) => {
						actionPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return bridgeit.io.action.createAction({
								realm: newRealmName,
								id: action._id,
								action: action
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(actionPromises);

			}).then(() => {
				log('completed cloning actions');

				//docs, will only fetch documents in the main collection
				//TODO awaiting http://jira.icesoft.org/browse/NTFY-388
				log('fetching document service documents');
				return bridgeit.io.documents.findDocuments({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching documents: ' + err.responseText);
				});

			}).then((documents) => {

				var docPromises = [];
				if( documents ){
					log('cloning ' + documents.length + ' documents');
					documents.forEach((doc) => {
						docPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return bridgeit.io.documents.createDocument({
								realm: newRealmName,
								document: doc
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(docPromises);

			}).then(() => {
				log('completed cloning documents');

				//eventhub handlers
				log('fetching eventhub handlers');
				return bridgeit.io.eventhub.findHandlers({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching handlers: ' + err.responseText);
				});

			}).then((handlers) => {

				var handlerPromises = [];
				if( handlers ){
					log('cloning ' + handlers.length + ' handlers');
					handlers.forEach((handler) => {
						handlerPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return bridgeit.io.eventhub.createHandler({
								realm: newRealmName,
								id: handler.id,
								handler: handler
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(handlerPromises);

			}).then(() => {
				log('completed cloning handlers');

				//eventhub recognizers
				log('fetching eventhub recognizers');
				return bridgeit.io.eventhub.findRecognizers({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching recognizers: ' + err.responseText);
				});

			}).then((recognizers) => {

				var recognizerPromises = [];
				if( recognizers ){
					log('cloning ' + recognizers.length + ' recognizers');
					recognizers.forEach((recognizer) => {
						recognizerPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							bridgeit.io.eventhub.createRecognizer({
								realm: newRealmName,
								id: recognizer.id,
								recognizer: recognizer
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(recognizerPromises);

			}).then(() => {
				log('completed cloning recognizers');

				//eventhub queries
				log('fetching query service queries');
				return bridgeit.io.query.findQueries({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching queries: ' + err.responseText);
				});

			}).then((queries) => {

				var queryPromises = [];
				if( queries ){
					log('cloning ' + queries.length + ' queries');
					queries.forEach((query) => {
						queryPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							bridgeit.io.query.createQuery({
								realm: newRealmName,
								query: query
							}).catch((err) => {
								log('ERROR: ' + err.responseText);
							});
						}));
					});
				}
				return Ember.RSVP.Promise.all(queryPromises);

			}).then(() => {
				log('completed cloning queries');

				log('fetching new realm: ' + newRealmName);

				return bridgeit.io.admin.getRealm({realm: newRealmName});

			}).then((clonedRealm) => {

				//after the newly cloned realm has been created we need to refetch it
				//and push it into the app state
				var account = this.get('application.account');
				realm.set('account', account);
				account.get('realms').pushObject(clonedRealm);
				this.set('cloneRealmInProcess', false);
				log('clone realm process completed');
				//this.transitionToRoute('secure.realms.index', clonedRealm);

			}).catch((err) => {
				this.set('cloneRealmInProcess', false);
				this.error('could not clone realm');
      			this.get('application').showErrorMessage(err, 'Could not complete realm cloning.');
			});

		},
	}
});
