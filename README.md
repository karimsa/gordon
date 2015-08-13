# gordon

a natural language event emitter.

## example

```javascript
var Gordon = require('./');
var emitter = new Gordon();

// map out the event
emitter.event('greeting', '[... hi, hey, hello], $subject.');

// hook onto the event
emitter.on('greeting', function (data) {
  console.log(data);
});

// this will trigger the event 'greeting'
emitter.emit('hey, Gordon.');
```
