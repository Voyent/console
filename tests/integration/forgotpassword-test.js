import Ember from "ember";
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
var App;

module('Integration:forgotpassword', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});

test("Forgot Password Fields", function(assert) {
 assert.expect(2);
 visit('/forgotpassword').then(function() {
   assert.equal(find('#username').length, 1, "Page contains username field");
   assert.equal(find('#account').length, 1, "Page contains account field");
 });
});

//TODO false negative
test("Send forgot password", function(assert) {
  assert.expect(1);
  visit('/forgotpassword').then(function() {
    fillIn('#username', 'testuser');
    fillIn('#account', 'demos');
    click('#submit');
    App.testHelpers.wait().then(() => {
      assert.equal(find('.toast-info').length, 1, "Passed: received the success message");
    });
  });
});

//TODO false negative
test("Try to send forgotten password", function(assert) {
  assert.expect(1);
  visit('/forgotpassword').then(function() {
    fillIn('#username', 'baduser');
    fillIn('#account', 'demos');
    click('#submit');
    App.testHelpers.wait().then(() => {
      assert.equal(find('.toast-error').length, 1, "Passed: received the error message");
    });
  });
});



