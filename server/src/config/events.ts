import { EventEmitter } from 'events';

declare global {
  var eventEmitter: EventEmitter;
}

global.eventEmitter = new EventEmitter();

// Increase max listeners to handle multiple SSE connections
global.eventEmitter.setMaxListeners(100);

export default global.eventEmitter; 