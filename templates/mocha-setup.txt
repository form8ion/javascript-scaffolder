import sinon from 'sinon';
import chai from 'chai';

sinon.assert.expose(chai.assert, {prefix: ''});

process.on('unhandledRejection', reason => {
  throw reason;
});
