import { telegram } from './telegram';
import { Archived } from './types';

export class Archiver {
  private source: 'telegram' = 'telegram';
  private params: any;
  private stdout = false;

  output(o: boolean): this {
    this.stdout = typeof o === 'boolean' ? o : true;

    return this;
  }

  telegram(args: { channel: string; msgid: number }): this {
    const { channel, msgid } = args;
    if (!channel || !msgid) {
      throw new Error('channel and msgid is require by telegram');
    }

    this.source = 'telegram';

    this.params = args;

    return this;
  }

  async start(): Promise<Archived[]> {
    let archived: Archived[];

    switch (this.source) {
      case 'telegram': {
        archived = await telegram(this.params);
        break;
      }
    }

    if (this.stdout === true) {
      console.info(archived);
    }

    return archived;
  }
}
