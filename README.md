# archiver

Read this in other languages: English | [简体中文](./README_zh-CN.md)

Archive webpages from Telegram channel and etc.

## Installation

Using npm:

```bash
npm install @wabarc/archiver
```

Using yarn:

```bash
yarn add @wabarc/archiver
```

## Example

```javascript
import { Archiver } from '@wabarc/archiver';
// const archiver = require('@wabarc/archiver');

const archived = await new Archiver().telegram({ channel: 'channel_name', msgid: 1 }).start();
console.log(archived)
```

## Instance methods

The available instance methods are listed below.

- archiver#telegram({ channel: string, msgid: number })
- archiver#start()

## Request Params

### Telegram

These are the available options for archival webpage from Telegram channel. `channel` and `msgid` is required.

```javascript
{
  // `channel` is the Telegram channel name
  channel: 'wabarc_testing',

  // `msgid` is the message id published on the Telegram channel.
  msgid: 1
}
```

## Response Schema

```javascript
[
  {
    id: 1,
    url: 'https://example.org/',
    title: 'Example ORG',
    content: '<html><head></head><body>body content</body></html>',
    success: true
  }
]
```

## License

This software is released under the terms of the GNU General Public License v3.0. See the [LICENSE](https://github.com/wabarc/archiver/blob/main/LICENSE) file for details.
