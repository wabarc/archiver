import axios from 'axios';
import { extractURI, pageTitle, pageMissing } from './utils';
import { Archived, Types } from './types';
import { cairn, Archived as R } from '@wabarc/cairn';
import cheerio from 'cheerio';

const archive = async (uri: string): Promise<R> => {
  return await cairn.request({ url: uri }).archive();
};

const msgEmbed = async (telegram: Types['telegram']): Promise<string> => {
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
};

const successful = (archived: Archived[]): boolean => {
  if (archived.length < 1) {
    return false;
  }

  if (archived.filter((arc) => arc.success === false).length > 0) {
    return false;
  }

  return true;
};

export const telegram = async (telegram: Types['telegram']): Promise<Archived[]> => {
  const { msgid } = telegram;

  let archived: Archived[] = [];
  let arc: R;

  if (!msgid || typeof msgid !== 'number' || msgid <= 0) {
    return archived;
  }

  const compact = async (uris: string[]): Promise<Archived[]> => {
    for (const uri of uris) {
      arc = await archive(uri);
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

  const embedHTML = await msgEmbed(telegram);
  for (const slot of ['orig', 'ia', 'is']) {
    const urls = extractURI(embedHTML, slot);
    if (urls.length < 1) {
      continue;
    }

    archived = await compact(urls);
    if (successful(archived)) {
      return archived;
    }
  }

  const ipfsURIs = extractURI(embedHTML, 'ipfs');
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
};
