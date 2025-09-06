import { EventEmitter } from 'events';

// Create a single, shared instance of an EventEmitter.
// This will act as our event bus for the entire application.
const eventEmitter = new EventEmitter();

export default eventEmitter;
