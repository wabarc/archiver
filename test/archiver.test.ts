import { Archiver, archiver } from '../src';
// const archiver = require('../src');

it('should process archiver', async () => {
  await new Archiver().telegram({ channel: 'wabarc_testing', msgid: 1 }).start();
  await archiver.telegram({ channel: 'wabarc_testing', msgid: 1 }).start();

  expect(new Archiver()).toBeInstanceOf(Archiver);
  expect(archiver).toBeInstanceOf(Archiver);
});

it('should process archiver do func', async () => {
  const pack = await archiver.do({ channel: 'wabarc_testing', context: { dir: process.cwd(), from: 1, to: 3 } });
  console.log(pack);

  expect(pack.length).toEqual(3);
  expect(pack.filter((pck) => pck.success === true).length).toEqual(2);
  expect(pack.filter((pck) => pck.success === false).length).toEqual(1);
  expect(pack.filter((pck) => pck.url === '').length).toEqual(1);
});

it('should process archiver stage func', async () => {
  const stage = await archiver.stage({ channel: 'wabarc_testing', context: { dir: process.cwd(), from: 1, to: 3 } });
  console.log(stage);

  expect(stage.length).toEqual(3);
  stage.forEach((s) => console.log(s));
});
