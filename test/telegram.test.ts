// telegram channel message template: ./message.tpl
import { telegram } from '../src/telegram';

const channel = 'wabarc_testing';

// console.error = jest.fn((error) => {
//   console.log(error);
// });

it('should process invalid telegram channel', async () => {
  const result = await telegram.archive({ channel: 'this-channel-not-exists', msgid: 1 });
  expect(result).toHaveLength(0);
});

it('should containing one available original url', async () => {
  const archived = await telegram.archive({ channel: channel, msgid: 2 });
  const succeed = archived.filter((arc) => arc.success === true).length;

  expect(succeed).toBeGreaterThanOrEqual(1);
});

it('should containing multi available original url', async () => {
  const archived = await telegram.archive({ channel: channel, msgid: 3 });
  const succeed = archived.filter((arc) => arc.success === true).length;

  // Limited by the strict CAPTCHA policy of Archive.today, it may be equal 1
  expect(succeed).toBeGreaterThanOrEqual(1);
});

it('should process webpage missing original but exists Internet Archive', async () => {
  const archived = await telegram.archive({ channel: channel, msgid: 4 });
  const succeed = archived.filter((arc) => arc.success === true).length;

  expect(succeed).toBeGreaterThanOrEqual(1);
});

// Limited by the strict CAPTCHA policy of Archive.today, it will skip
it.skip('should process webpage missing original but only exists Archive Today', async () => {
  const archived = await telegram.archive({ channel: channel, msgid: 5 });
  const succeed = archived.filter((arc) => arc.success === true).length;

  expect(succeed).toBeGreaterThanOrEqual(1);
});

it('should process webpage missing original but only exists IPFS', async () => {
  const archived = await telegram.archive({ channel: channel, msgid: 6 });
  const succeed = archived.filter((arc) => arc.success === true).length;

  expect(succeed).toBeGreaterThanOrEqual(1);
});

it('should process webpage from IPFS directory', async () => {
  const archived = await telegram.archive({ channel: channel, msgid: 7 });
  const succeed = archived.filter((arc) => arc.success === true).length;

  expect(succeed).toBeGreaterThanOrEqual(1);
});
