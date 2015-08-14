# gordon

a natural language event emitter.

[![NPM](https://nodei.co/npm/gordon.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gordon/)

## example

```javascript
var Gordon = require('gordon');
var emitter = new Gordon();

// register the event and respective templates
emitter.register('greeting', [
  '[... hi, hey, hello], $subject.',
  'how are you, $subject?'
]);

// hook onto the event
emitter.on('greeting', function (data) {
  console.log(data);
});

// this will trigger the event 'greeting'
emitter.emit('hey, Gordon.');
```
