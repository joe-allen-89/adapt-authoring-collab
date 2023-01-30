define(function(require) {
  var Origin = require('core/origin');
  
  Origin.on('origin:dataReady', () => {
    const [protocol, serverRoot] = window.location.origin.split('//');
    const s = new WebSocket(`ws://${serverRoot}/socket`);
    s.addEventListener('open', e => s.send('Hello Server!'));
    s.addEventListener('message', e => console.log('Message from server ', e.data));
  });
});