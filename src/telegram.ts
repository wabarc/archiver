import axios from 'axios';
import { extractURI, pageTitle, pageMissing } from './utils';
import { Archived, Config, Types, Stage } from './types';
import { cairn, Archived as R } from '@wabarc/cairn';
import cheerio from 'cheerio';

class Telegram {
  async archiving(uri: string): Promise<R> {
    return await cairn.request({ url: uri }).archive();
  }

  async msgEmbed(telegram: Types['telegram']): Promise<string> {
    const { channel, msgid } = telegram;
    if (channel.length < 1 || msgid < 1) {
      return '';
    }

    const url = `https://t.me/${channel}/${msgid}?embed=1`;
    try {
      const response = await axios.get(url);

      return response.data;
    } catch (err) {
      console.warn(err.message);
      return '';
    }
  }

  successful(archived: Archived[]): boolean {
    if (archived.length < 1) {
      return false;
    }

    if (archived.filter((arc) => arc.success === false).length > 0) {
      return false;
    }

    return true;
  }

  async archive(telegram: Types['telegram']): Promise<Archived[]> {
    const { msgid } = telegram;

    let archived: Archived[] = [];
    let arc: R;

    if (!msgid || typeof msgid !== 'number' || msgid <= 0) {
      return archived;
    }

    const compact = async (uris: string[]): Promise<Archived[]> => {
      for (const uri of uris) {
        try {
          arc = await this.archiving(uri);
        } catch (e) {
          console.warn(e.message);
          continue;
        }
        const success = arc.status === 200 && arc.url === uri;
        if (!success || !arc.webpage) {
          continue;
        }

        const $: cheerio.Root = arc.webpage;
        if (pageMissing($)) {
          continue;
        }

        archived.push({
          id: msgid,
          url: uri,
          title: pageTitle($),
          content: $.html(),
          success: success,
        });
      }
      return archived;
    };

    const embedHTML = await this.msgEmbed(telegram);
    for (const slot of ['orig', 'ia', 'is', 'ph']) {
      const urls = extractURI(embedHTML, slot);
      if (urls.length < 1) {
        continue;
      }

      archived = await compact(urls);
      if (this.successful(archived)) {
        return archived;
      }
    }

    const ipfsURIs = extractURI(embedHTML, 'ip');
    if (ipfsURIs.length > 0) {
      let counter = 1;
      // Process IPFS directory
      while ((archived = await compact(ipfsURIs))) {
        if (counter >= 3) {
          break;
        }

        await new Promise((r) => setTimeout(r, 500));

        const current = archived[archived.length - 1];
        if (!current || !current['content']) {
          ++counter;
          continue;
        }

        const $ = cheerio.load(current['content']);
        const href = $('table > tbody > tr:nth-child(2) > td:nth-child(3) > a').attr('href');
        if (!href || typeof href !== 'string' || href.length === 0) {
          break;
        }

        ipfsURIs.shift();
        ipfsURIs.push(href);
        archived.pop();

        ++counter;
      }
    }

    return archived;
  }

  /**
   * stages returns items which prepare to archive
   * example:
   * [
   *   {
   *     id: 1,
   *     stage: {
   *       orig: ["https://example.org/", "https://example.com/"],
   *         ia: ["https://web.archive.org/web/20210203140051/https://example.org"],
   *         is: ["https://archive.today/xxM3V", "https://archive.is/eV099"],
   *         ip: ["https://ipfs.io/ipfs/QmTrZ1YpBxUfkSE9qHnYxFoY3CQi8KogBbakRq8gQJJ9X3"],
   *         ph: ["https://telegra.ph/Example-Domain-02-03"]
   *     }
   *   }
   * ]
   */
  async stage(config: Config): Promise<Stage[]> {
    const { channel, context } = config;
    if (!channel || context.from === undefined || context.to === undefined || context.from > context.to) {
      throw new Error('Missing params.');
    }

    const stages: Stage[] = [];
    for (let start = context.from; start <= context.to; start++) {
      const embedHTML = await this.msgEmbed({ channel: channel, msgid: start });
      const stage = { orig: [], ia: [], is: [], ph: [], ip: [] };
      for (const slot of ['orig', 'ia', 'is', 'ph', 'ip']) {
        const urls = extractURI(embedHTML, slot);
        if (urls.length < 1) {
          continue;
        }
        stage[slot] = urls;
      }
      stages.push({ id: start, stage: stage });
    }

    return stages;
  }
}

const telegram = new Telegram();
export { telegram };
