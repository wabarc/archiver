import { Archiver, archiver } from '../src';
// const archiver = require('../src');

it('should process archiver', async () => {
  await new Archiver().telegram({ channel: 'wabarc_testing', msgid: 1 }).start();
  await archiver.telegram({ channel: 'wabarc_testing', msgid: 1 }).start();

  expect(new Archiver()).toBeInstanceOf(Archiver);
  expect(archiver).toBeInstanceOf(Archiver);
});
