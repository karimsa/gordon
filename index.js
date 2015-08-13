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
      );
    },
    Gordon = function () {
      this.classifier = new LogisticRegressionClassifier();
      this.events = new EventEmitter();
      this.map = {};
    };

// .event([event name], [list of triggers]);
// create an event's map or append to an existing one.
Gordon.prototype.event = function (name, triggers) {
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
Gordon.prototype.on = function () {
  this.events.on.apply(this.events, arguments);
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

// .emit([trigger], [data]);
// emit the correct event with the respective data.
Gordon.prototype.emit = function (trigger) {
  // we need to flatten the trigger to make sure
  // that variable names are not being used in the classifier
  var plainTrigger = plain(trigger);

  // use the classifier to find the proper event name
  var eventName = this.classifier.classify(plainTrigger);

  // find the template to use
  var template = this.map[eventName].classifier.classify(plainTrigger);
  template = this.map[eventName][template];

  // pass our trigger through the template
  var eventData = template(trigger);

  // emit the event on the actual interface
  this.events.emit(eventName, eventData);
  return this;
};

// expose
module.exports = Gordon;
