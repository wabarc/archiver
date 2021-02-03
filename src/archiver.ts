import { existsSync, writeFileSync } from 'fs';
import { Archived, Config, Stage, Task } from './types';
import { telegram } from './telegram';
import { createFilename } from './utils';
import { minify } from 'html-minifier';

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
        archived = await telegram.archive(this.params);
        break;
      }
    }

    if (this.stdout === true) {
      console.info(archived);
    }

    return archived;
  }

  async do(config: Config): Promise<Task[]> {
    const { channel, context } = config;
    if (
      !channel ||
      context.dir === undefined ||
      context.from === undefined ||
      context.to === undefined ||
      context.from > context.to
    ) {
      throw new Error('Missing params.');
    }

    if (!existsSync(context.dir)) {
      throw new Error(`Directory ${context.dir} not exists or no permission.`);
    }

    const tasks: Task[] = [];
    for (let start = context.from; start <= context.to; start++) {
      const archived = await this.telegram({ channel: channel, msgid: start }).start();
      if (archived.length === 0) {
        tasks.push({ id: start, url: '', path: '', success: false });
        continue;
      }

      archived.forEach((arc: { url: string; title: string; content: string }) => {
        const filepath = `${context.dir}/${createFilename(arc.url, arc.title)}`;
        if (filepath.endsWith('/')) {
          console.warn('Packer warn: filepath is directory, skip');
          return;
        }

        try {
          arc.content = minify(arc.content, {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
          });
        } catch (_) {
          console.warn('Packer warn: minify failure.');
        }

        try {
          writeFileSync(filepath, arc.content);
        } catch (e) {
          console.warn(`Packer failure: illegal operation, code '${e.code}', open '${e.path}'`);
          arc.content = '';
          return;
        }

        tasks.push({ id: start, url: arc.url, path: filepath, success: true });
      });
    }

    return tasks;
  }

  async stage(config: Config): Promise<Stage[]> {
    return telegram.stage(config);
  }
}
