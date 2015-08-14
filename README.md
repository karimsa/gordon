# gordon

a natural language event-emitter interface.

[![NPM](https://nodei.co/npm/gordon.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gordon/)

## usage

Gordon's interface is based on the traditional event emitter, but with a few twists to support the ideas
of natural language. Event names work like normal, but [pennyworth](https://github.com/karimsa/pennyworth)
templates can be associated with event names for a more natural experience.

When `.emit()` is called with a natural language string, gordon will find the most appropriate registered
event and use its most appropriate template to parse the emitted text. The event will then be fired with
the event data being the compiled template.

### initializing a new emitter

```javascript
var Gordon = require('gordon');
var emitter = new Gordon();
```

### adding an event listener

For unregistered events, you can use `.when()` to attach an event
handler to a trigger template.

```javascript
emitter.when('my name is $subject.', function (data) {
  console.log('hello there, %s', data.subject);
});
```

### registering an event

To register an event is to associate a certain trigger template or list
of templates with an event. This allows you to hook onto a group of templates
that will provide you with the same data.

On every call, you can register a single template or a list of templates. Follow
up calls will not re-allocate the template list but rather append to it.

```javascript
emitter.register('introduction', [
  '[... hi, hey, hello], $subject.',
  'how are you, $subject?'
]);
```

### attaching to an event

This works exactly the same as with a regular event emitter.

```javascript
emitter.on('introduction', function (data) {
  console.log('hello there, %s.', data.subject);
});
```

### emitting an event (using a trigger)

Call emit with a trigger, which is the input data to a pennyworth
template.

```javascript
emitter.emit('hey, Gordon.');
```
