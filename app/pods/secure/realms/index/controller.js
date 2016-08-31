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
	isCreatingNewResource: false,

	openConfirmDeleteRealmPopup: function() {
		Ember.$('#deleteRealmModal').modal();
	},

	closeDeleteRealmPopup: function() {
		Ember.$('#deleteRealmModal').modal('hide');
	},

	accountUsernames: function(){
		//gather all usernames from account admins and realm users
		let usernames = this.get('application.account.adminUsernames');
		let realmUsers = this.get('model.users');
		if( realmUsers ){
			usernames = usernames.concat(realmUsers.map((u) => u.get('username')));
		}
		return usernames;
	}.property('application.account.admins.[]', 'model.users.[]'),

	validateResource: function(resource, id, service, path){
		//this is undefined as function is called by component
		if( service === 'action'){
			if( !id ){
				window.alert('Please enter the required id for the action.');
				return false;
			}
		}
		else if( service === 'documents'){

		}
		else if( service === 'query'){

		}
		else if( service === 'mailbox'){

		}
		else if( service === 'location'){
			if( path === 'poi'){

			}
			else if( path === 'regions'){

			}
		}
		return true;
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

			return voyent.io.admin.deleteRealm({realmName: realm.get('id')}).then(() => {

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
			return voyent.io.admin.cloneRealm({originRealmName: realm.get('id'), destRealmName: newRealmName}).then((clonedRealmURI) => {
				log('created newly cloned realm with basic info: ' + clonedRealmURI);

				//clone all POIs
				log('fetching location service POIs');
				return voyent.io.location.getAllPOIs({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching POIs: ' + err.responseText);
				});

			}).then((pois) => {

				var poiPromises = [];
				if( pois ){
					log('cloning ' + pois.length + ' POIs');
					pois.forEach((poi) => {
						poiPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return voyent.io.location.createPOI({
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
				return voyent.io.location.findRegions({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching regions: ' + err.responseText);
				});

			}).then((regions) => {

				var regionPromises = [];
				if( regions ){
					log('cloning ' + regions.length + ' regions');
					regions.forEach((region) => {
						regionPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return voyent.io.location.createRegion({
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

				//actions
				log('fetching action service actions');
				return voyent.io.action.findActions({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching actions: ' + err.responseText);
				});

			}).then((actions) => {

				var actionPromises = [];
				if( actions ){
					log('cloning ' + actions.length + ' actions');
					actions.forEach((action) => {
						actionPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return voyent.io.action.createAction({
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
				return voyent.io.documents.findDocuments({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching documents: ' + err.responseText);
				});

			}).then((documents) => {

				var docPromises = [];
				if( documents ){
					log('cloning ' + documents.length + ' documents');
          let realm = this.get('model');
          var collection = realm.get('collection');
          documents.forEach((doc) => {
						docPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return voyent.io.documents.createDocument({
								realm: newRealmName,
								document: doc,
                collection: collection
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
				return voyent.io.eventhub.findHandlers({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching handlers: ' + err.responseText);
				});

			}).then((handlers) => {

				var handlerPromises = [];
				if( handlers ){
					log('cloning ' + handlers.length + ' handlers');
					handlers.forEach((handler) => {
						handlerPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							return voyent.io.eventhub.createHandler({
								realm: newRealmName,
								id: handler._id,
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
				return voyent.io.eventhub.findRecognizers({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching recognizers: ' + err.responseText);
				});

			}).then((recognizers) => {

				var recognizerPromises = [];
				if( recognizers ){
					log('cloning ' + recognizers.length + ' recognizers');
					recognizers.forEach((recognizer) => {
						recognizerPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							voyent.io.eventhub.createRecognizer({
								realm: newRealmName,
								id: recognizer._id,
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
				return voyent.io.query.findQueries({realm: oldRealmName}).catch((err) => {
					log('ERROR fetching queries: ' + err.responseText);
				});

			}).then((queries) => {

				var queryPromises = [];
				if( queries ){
					log('cloning ' + queries.length + ' queries');
					queries.forEach((query) => {
						queryPromises.push(Ember.RSVP.Promise.resolve().then(() => {
							voyent.io.query.createQuery({
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

				return voyent.io.admin.getRealm({realm: newRealmName});

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

    loadResourceCollection: function(target){
      if(target) {
        this.set('collection', target);
      }
      var ember = this;
      voyent.io.documents.findDocuments({collection:target}).then((documents) => {
          let realm = ember.get('model');
          realm.set('documents',documents);
          realm.set('collection',target);
      });
    },

		showResource: function(resource, service, path){

	var ember = this;
      function resourceCallback(resource, service, path) {
			ember.set('selectedResource', resource);
			ember.set('serviceForResource', service);
			ember.set('showResourcePopup', true);
			ember.set('selectedResourcePath', path);
      }

      switch (service) {
        case 'documents':
          let realm = this.get('model');
          var collection = realm.get('collection');
          voyent.io.documents.getDocument({'id': resource._id, 'collection':collection}).then(function (doc) {
            resourceCallback(doc, service, path);
          });
          break;
        case 'eventhub':
          voyent.io.eventhub.getHandler({'id': resource._id}).then(function (handler) {
            resourceCallback(handler, service, path);
          }).catch(function (err) {
            if (err.status === 404) {
              voyent.io.eventhub.getRecognizer({'id': resource._id}).then(function (recognizer) {
                resourceCallback(recognizer, service, path);
              });
            }
          });
          break;
        case 'location':
          voyent.io.location.findRegions({'query': {'_id': resource._id}}).then(function (region) {
            resourceCallback(region[0], service, path);
          }).catch(function () {
            voyent.io.location.findPOIs({'query': {'_id': resource._id}}).then(function (poi) {
              resourceCallback(poi[0], service, path);
            });
          });
          break;
        case 'action':
          voyent.io.action.getAction({'id': resource._id}).then(function (action) {
            resourceCallback(action, service, path);
          });
          break;
        case 'query':
          voyent.io.query.getQuery({'id': resource._id}).then(function (query) {
            resourceCallback(query[0], service, path);
          });
          break;
        case 'mailbox':
          voyent.io.mailbox.getMailbox({'id': resource._id}).then(function (mailbox) {
            resourceCallback(mailbox, service, path);
          });
          break;
        case 'push':
          voyent.io.push.getCloudRegistration({'id': resource._id}).then(function (registration) {
            resourceCallback(registration[0], service, path);
          });
          break;
      }

		},

		onResourceSaved: function(resource, id){
			if( resource ){
				let service = this.get('serviceForResource');
				let realm = this.get('model');
				let path = this.get('selectedResourcePath');
				let originalResource = this.get('selectedResource');

				return Ember.RSVP.Promise.resolve().then(() => {
					//update existing resource
					if( originalResource._id ){

						resource._id = originalResource._id; //ensure id remains constant

						if( service === 'documents'){
              let realm = this.get('model');
              var collection = realm.get('collection');
              return voyent.io.documents.updateDocument({id: originalResource._id, document: resource, collection:collection}).then(() => {
                  realm.set('documents', realm.get('documents').map((d) => d._id === resource._id ? resource : d));
							});
						}
						else if( service === 'action'){
							return voyent.io.action.updateAction({id: originalResource._id, action: resource}).then(() => {
								realm.set('actions', realm.get('actions').map((d) => d._id === resource._id ? resource : d));
							});
						}
						else if( service === 'eventhub'){
							if( path === 'handlers'){
								voyent.io.eventhub.updateHandler({id: originalResource._id, handler: resource}).then(() => {
									realm.set('handlers', realm.get('handlers').map((d) => d._id === resource._id ? resource : d));
								});
							}
							else if( path === 'recognizers'){
								voyent.io.eventhub.updateRecognizer({id: originalResource._id, recognizer: resource}).then(() => {
									realm.set('recognizers', realm.get('recognizers').map((d) => d._id === resource._id ? resource : d));
								});
							}
						}
						else if( service === 'location'){
							if( path === 'regions'){
								voyent.io.location.updateRegion({id: originalResource._id, region: resource}).then(() => {
									realm.set('regions', realm.get('regions').map((d) => d._id === resource._id ? resource : d));
								});
							}
							else if( path === 'poi'){
								voyent.io.location.updatePOI({id: originalResource._id, poi: resource}).then(() => {
									realm.set('pois', realm.get('pois').map((d) => d._id === resource._id ? resource : d));
								});
							}
						}
            else if( service === 'query'){
              return voyent.io.query.updateQuery({id: originalResource._id, query: resource}).then(() => {
                  realm.set('query', realm.get('queries').map((d) => d._id === resource._id ? resource : d));
            });
            }
            else if( service === 'mailbox'){
              return voyent.io.mailbox.updateMailbox({id: originalResource._id, mailbox: resource}).then(() => {
                  realm.set('mailbox', realm.get('mailboxes').map((d) => d._id === resource._id ? resource : d));
            });
            }
            else if( service === 'push'){
              return voyent.io.push.updateCloudRegistration({id: originalResource._id, resource: resource}).then(() => {
                  realm.set('registrations', realm.get('registrations').map((d) => d._id === resource._id ? resource : d));
            });
            }

					}
					//create new resource
					else{

						if( id ){
							resource._id = id;
						}

						return Ember.RSVP.Promise.resolve().then(() => {
							if( service === 'documents'){
                let realm = this.get('model');
                var collection = realm.get('collection');
								return voyent.io.documents.createDocument({document: resource,collection:collection}).then((uri) => {
                    realm.get('documents').pushObject(resource);
									return uri;
								});
							}
							else if( service === 'action'){
								return voyent.io.action.createAction({id: id, action: resource}).then((uri) => {
									realm.get('actions').pushObject(resource);
									return uri;
								});
							}
							else if( service === 'eventhub'){
								if( path === 'handlers'){
									return voyent.io.eventhub.createHandler({id: id, handler: resource}).then((uri) => {
										realm.get('handlers').pushObject(resource);
										return uri;
									});
								}
								else if( path === 'recognizers'){
									return voyent.io.eventhub.createRecognizer({id: id, recognizer: resource}).then((uri) => {
										realm.get('recognizers').pushObject(resource);
										return uri;
									});
								}
							}
							else if( service === 'location'){
								if( path === 'regions'){
									return voyent.io.location.createRegion({id: id, region: resource}).then((uri) => {
										realm.get('regions').pushObject(resource);
										return uri;
									});
								}
								else if( path === 'poi'){
									return voyent.io.location.createPOI({id: id, poi: resource}).then((uri) => {
										realm.get('pois').pushObject(resource);
										return uri;
									});
								}
							}
						}).then((uri) => {
							//set new id on the resource if the user hasn't
							if( !id){
								let uriParts = uri.split('/');
								let newId = uriParts[uriParts.length-1];
								resource._id = newId;
							}
						});
					}
				}).then(() => {
					this.get('toast').info(path + ' resource saved');
					this.set('editingResource', false); //reset
				}).catch((error) => {
					this.get('application').showErrorMessage(error, path + ' resource could not be saved');
				});
			}

		},

		onResourceClosed: function(){
			this.set('selectedResource', null);
			this.set('showResourcePopup', false);
			this.set('selectedResourcePath', null);
			this.set('serviceForResource', null);
			this.set('isCreatingNewResource', false);
		},

    editResource: function (resource, service, path) {
      var ember = this;
      function resourceCallback(resource, service, path) {

        ember.set('editingResource', true);
        ember.set('showResourcePopup', true);
        ember.set('selectedResource', resource);
        ember.set('serviceForResource', service);
        ember.set('selectedResourcePath', path);
        ember.set('isCreatingNewResource', false);
      }

      switch (service) {
        case 'documents':
          let realm = this.get('model');
          var collection = realm.get('collection');
          voyent.io.documents.getDocument({'id': resource._id,collection:collection}).then(function (doc) {
            resourceCallback(doc, service, path);
          });
          break;
        case 'eventhub':
          voyent.io.eventhub.getHandler({'id': resource._id}).then(function (handler) {
            resourceCallback(handler, service, path);
          }).catch(function (err) {
            if (err.status === 404) {
              voyent.io.eventhub.getRecognizer({'id': resource._id}).then(function (recognizer) {
                resourceCallback(recognizer, service, path);
              });
            }
          });
          break;
        case 'location':
          voyent.io.location.findRegions({'query': {'_id': resource._id}}).then(function (region) {
            resourceCallback(region[0], service, path);
          }).catch(function () {
            voyent.io.location.findPOIs({'query': {'_id': resource._id}}).then(function (poi) {
              resourceCallback(poi[0], service, path);
            });
          });
          break;
        case 'action':
          voyent.io.action.getAction({'id': resource._id}).then(function (action) {
            resourceCallback(action, service, path);
          });
          break;
        case 'query':
          voyent.io.query.getQuery({'id': resource._id}).then(function (query) {
            resourceCallback(query[0], service, path);
          });
          break;
        case 'mailbox':
          voyent.io.mailbox.getMailbox({'id': resource._id}).then(function (mailbox) {
            resourceCallback(mailbox, service, path);
          });
          break;
        case 'push':
          voyent.io.push.getCloudRegistration({'id': resource._id}).then(function (registration) {
            resourceCallback(registration[0], service, path);
          });
          break;
      }

    },


		deleteResource: function(resource, service, path){
			let resourceType;
			if( service === 'documents' ){
				resourceType = 'document';
			}
			else if( service === 'action'){
				resourceType = 'action';
			}
      else if( service === 'push'){
        resourceType = 'push registration';
      }

			this.set('confirmDeleteResourceText', 'Are you sure you want to delete the ' + resourceType + ' ' + resource._id + '?');
			this.set('resourceToDelete', resource);
			this.set('serviceForResource', service);
			this.set('selectedResourcePath', path);
		},

		onConfirmDeleteResource: function(){
			let resource = this.get('resourceToDelete');
			let service = this.get('serviceForResource');
			let path = this.get('selectedResourcePath');
      let realm = this.get('model');
      var collection = realm.get('collection');
			if( resource ){
				if( service === 'documents'){
					voyent.io.documents.deleteDocument({id: resource._id,collection:collection}).then(() => {
						//remove doc from realm
						let realm = this.get('model');
            realm.set('documents', realm.get('documents').filter((d) => d._id !== resource._id));
						this.get('toast').info('Document deleted');
						this.set('resourceToDelete', null);
						this.set('confirmDeleteResourceText', null);
					}).catch((error) => {
						this.get('application').showErrorMessage(error, 'Document could not be deleted');
					});
				}
				else if( service === 'action'){
					voyent.io.action.deleteAction({id: resource._id}).then(() => {
						let realm = this.get('model');
						realm.set('actions', realm.get('actions').filter((d) => d._id !== resource._id));
						this.get('toast').info('Action deleted');
						this.set('resourceToDelete', null);
						this.set('confirmDeleteResourceText', null);
					}).catch((error) => {
						this.get('application').showErrorMessage(error, 'Action could not be deleted');
					});
				}
				else if( service === 'eventhub'){
					if( path === 'handlers'){
						voyent.io.eventhub.deleteHandler({id: resource._id}).then(() => {
							let realm = this.get('model');
							realm.set('handlers', realm.get('handlers').filter((d) => d._id !== resource._id));
							this.get('toast').info('Handler deleted');
							this.set('resourceToDelete', null);
							this.set('confirmDeleteResourceText', null);
						}).catch((error) => {
							this.get('application').showErrorMessage(error, 'Event Hub Handler could not be deleted');
						});
					}
					else if( path === 'recognizers' ){
						voyent.io.eventhub.deleteRecognizer({id: resource._id}).then(() => {
							let realm = this.get('model');
							realm.set('recognizers', realm.get('recognizers').filter((d) => d._id !== resource._id));
							this.get('toast').info('Recognizer deleted');
							this.set('resourceToDelete', null);
							this.set('confirmDeleteResourceText', null);
						}).catch((error) => {
							this.get('application').showErrorMessage(error, 'Event Hub Recognizer could not be deleted');
						});
					}

				}
				else if( service === 'location'){
					if( path === 'poi'){
						voyent.io.location.deletePOI({id: resource._id}).then(() => {
							let realm = this.get('model');
							realm.set('pois', realm.get('pois').filter((d) => d._id !== resource._id));
							this.get('toast').info('POI deleted');
							this.set('resourceToDelete', null);
							this.set('confirmDeleteResourceText', null);
						}).catch((error) => {
							this.get('application').showErrorMessage(error, 'Point of Interest could not be deleted');
						});
					}
					else if( path === 'regions' ){
						voyent.io.location.deleteRegion({id: resource._id}).then(() => {
							let realm = this.get('model');
							realm.set('regions', realm.get('regions').filter((d) => d._id !== resource._id));
							this.get('toast').info('Region deleted');
							this.set('resourceToDelete', null);
							this.set('confirmDeleteResourceText', null);
						}).catch((error) => {
							this.get('application').showErrorMessage(error, 'Region could not be deleted');
						});
					}

				}
        else if( service === 'push'){
          voyent.io.push.deleteCloudRegistration({id: resource._id}).then(() => {
            let realm = this.get('model');
          realm.set('registrations', realm.get('registrations').filter((d) => d._id !== resource._id));
          this.get('toast').info('Registration deleted');
          this.set('resourceToDelete', null);
          this.set('confirmDeleteResourceText', null);
        }).catch((error) => {
            this.get('application').showErrorMessage(error, 'Registration could not be deleted');
        });
        }
			}
		},

		onDenyDeleteResource: function(){
			this.set('resourceToDelete', null);
			this.set('confirmDeleteResourceText', null);
		},

		createNewResource: function(service, path){
			let resource = {};
			this.set('editingResource', true);
			this.set('selectedResource', resource);
			this.set('serviceForResource', service);
			this.set('showResourcePopup', true);
			this.set('selectedResourcePath', path);
			this.set('isCreatingNewResource', true);
		},

		showResourcePermissions: function(resource, service, path){
			this.set('selectedResource', resource);
			this.set('serviceForResource', service);
			this.set('showResourcePermissions', true);
			this.set('selectedResourcePath', path);
		},

		onCloseResourcePermissions: function(){
			this.set('selectedResource', null);
			this.set('serviceForResource', null);
			this.set('showResourcePermissions', false);
			this.set('selectedResourcePath', null);
		},

	}
});
