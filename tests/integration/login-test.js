import Ember from "ember";
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
var App;

module('Integration:login', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});

test("Login Fields", function(assert) {
 assert.expect(3);
 visit('/login').then(function() {
   assert.equal(find('#username').length, 1, "Page contains username field");
   assert.equal(find('#password').length, 1, "Page contains password field");
   assert.equal(find('#account').length, 1, "Page contains account field");
 });
});

test("Login as admin", function(assert) {
  assert.expect(1);
  visit('/login').then(function() {
    fillIn('#username', 'philip.breau');
    fillIn('#password', 'icesoftdemos');
    fillIn('#account', 'demos');
    click('#login');
    App.testHelpers.wait().then(() => {
      assert.equal(find('.current-user').length, 1, "Successfully logged in");
    });
  });
});

test("Try to Login with bad password", function(assert) {
  assert.expect(1);
  visit('/login').then(function() {
    fillIn('#username', 'philip.breau');
    fillIn('#password', 'wrongpass');
    fillIn('#account', 'demos');
    click('#login');
    App.testHelpers.wait().then(() => {
      assert.equal(find('#login').length, 1, "Passed: could not log in with bad pass");
    });
  });
});

test("Try to Login with as a non-admin", function(assert) {
  assert.expect(1);
  visit('/login').then(function() {
    fillIn('#username', 'testuser');
    fillIn('#password', 'password');
    fillIn('#account', 'demos');
    click('#login');
    App.testHelpers.wait().then(() => {
      assert.equal(find('#login').length, 1, "Passed: could not log in as normal user");
    });
  });
});

test("Go to forgot password", function(assert) {
  assert.expect(1);
  visit('/login').then(function() {
    click('#forgotpassword');
    andThen(() => {
      assert.ok(find('.panel-heading h1').text() === 'Forgot Password', "Navigated to /forgotpassword");
    });
  });
});

//TODO false negative
test("Go to forgot password with set username", function(assert) {
  assert.expect(1);
  visit('/login').then(function() {
    fillIn('#username', 'testuser');
    click('#forgotpassword');
    App.testHelpers.wait().then(() => {
      assert.ok(find('#username').text() === 'testuser', "Navigated to /forgotpassword with set username");
    });
  });
});

