/**
 * index.js - gordon
 * Copyright (C) 2015 Karim Alibhai.
 * Licensed under GPL-3.0.
 **/

'use strict';

var EventEmitter = require('events').EventEmitter,
    natural = require('natural'),
    pennyworth = require('pennyworth'),
    flatten = require('underscore').flatten,
    BayesClassifier = natural.BayesClassifier,
    LogisticRegressionClassifier = natural.LogisticRegressionClassifier,
    plain = function (prompt) {
      return pennyworth.flatten(
        pennyworth.parse(pennyworth.lex(prompt)).map(function (array) {
          return flatten(array);
        })
      ).map(function (text) {
        return text.replace(/\s+/g, '-');
      });
    },
    Gordon = function () {
      this.classifier = new LogisticRegressionClassifier();
      this.events = new EventEmitter();
      this.map = {};
    };

// .register([event name], [list of triggers]);
// create an event's map or append to an existing one.
Gordon.prototype.register = function (name, triggers) {
  // create a new map if none exists
  if (!this.map.hasOwnProperty(name)) this.map[name] = {
    classifier: new BayesClassifier()
  };

  // force array
  if (!(triggers instanceof Array)) triggers = [triggers];

  // record relevant event info
  triggers.forEach(function (trigger) {
    // add documents
    plain(trigger).forEach(function (plaintext) {
      this.map[name].classifier.addDocument(plaintext, trigger);
      this.classifier.addDocument(plaintext, name);
    }.bind(this));

    // create templates
    this.map[name][trigger] = pennyworth.template(trigger);
  }.bind(this));

  // re-train both classifiers
  this.map[name].classifier.train();
  this.classifier.train();

  return this;
};

// .on([event name], [event handler]);
// proxy the event emitter's on method.
Gordon.prototype.on = function (eventName) {
  var args = Array.prototype.slice.call(arguments);

  // translate trigger to event name if no such
  // event has been registered
  if (!this.map.hasOwnProperty(eventName)) args[0] = this.translate(eventName);

  // apply the inner on method
  this.events.on.apply(this.events, args);
  return this;
};

// .once([event name], [event handler]);
// proxy the event emitter's once method.
Gordon.prototype.once = function () {
  this.events.once.apply(this.events, arguments);
  return this;
};

// .off([event name], [event handler]);
// proxy the event emitter's off method.
Gordon.prototype.off = function () {
  this.events.removeListener.apply(this.events, arguments);
  return this;
};

// .translate([trigger]);
// translate a trigger to an event name
Gordon.prototype.translate = function (trigger) {
  // we need to flatten the trigger to make sure
  // that variable names are not being used in the classifier
  var plainTrigger = plain(trigger);

  // use the classifier to find the proper event name
  var eventName = this.classifier.classify(plainTrigger);

  // return the event name
  return eventName;
};

// .when([trigger], [event handler]);
// for quick event listening without registration
Gordon.prototype.when = function (trigger) {
  // create a new event for the trigger
  var eventName = 'misc:' + plain(trigger);

  // register the trigger under misc event
  this.register(eventName, trigger);

  // translate trigger to event name
  var args = Array.prototype.slice.call(arguments);
  args[0] = eventName;

  // bind to event
  return this.on.apply(this, args);
};

// .emit([trigger], [data]);
// emit the correct event with the respective data.
Gordon.prototype.emit = function (trigger, data) {
  // we need to flatten the trigger to make sure
  // that variable names are not being used in the classifier
  var plainTrigger = plain(trigger);

  // use the classifier to find the proper event name
  var eventName = this.translate(trigger);

  // find the template to use
  var template = this.map[eventName].classifier.classify(plainTrigger);
  template = this.map[eventName][template];

  // pass our trigger through the template
  var eventData = template(trigger);

  // assign payload as eventData
  Object.assign(eventData, data);

  // emit the event on the actual interface
  this.events.emit(eventName, eventData);
  return this;
};

// expose
module.exports = Gordon;
