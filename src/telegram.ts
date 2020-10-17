import axios from 'axios';
import { extractURI, pageTitle, pageURL } from './utils';
import { Archived, Types } from './types';
import { cairn } from '@wabarc/cairn';
import { JSDOM, VirtualConsole } from 'jsdom';

const archive = async (uri: string): Promise<string> => {
  return await cairn.request({ url: uri }).archive();
};

const msgEmbed = async (telegram: Types['telegram']): Promise<string> => {
  const { channel, msgid } = telegram;
  if (channel.length < 1 || msgid < 1) {
    return '';
  }

  const url = `https://t.me/${channel}/${msgid}?embed=1`;
  const response = await axios.get(url);

  return response.data;
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
  let webpage: string;

  if (!msgid || typeof msgid !== 'number' || msgid <= 0) {
    return archived;
  }

  const virtualConsole = new VirtualConsole().on('jsdomError', (e) => console.log('JSDOM', e));
  const compact = async (uris: string[]): Promise<Archived[]> => {
    for (const uri of uris) {
      webpage = await archive(uri);
      const success = webpage.length > 0;
      if (!success) {
        continue;
      }

      const doc = new JSDOM(webpage, { virtualConsole }).window.document;
      archived.push({
        id: msgid,
        url: pageURL(doc),
        title: pageTitle(doc),
        content: webpage,
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
    let doc;
    let counter = 1;
    // Process IPFS directory
    while ((archived = await compact(ipfsURIs))) {
      if (counter >= 5) {
        break;
      }

      await new Promise((r) => setTimeout(r, 500));

      doc = new JSDOM(archived[archived.length - 1]['content'], { virtualConsole }).window.document;
      const ipfsDir = doc.getElementById('content');
      if (!ipfsDir) {
        break;
      }
      const node = ipfsDir.getElementsByClassName('ipfs-hash');
      if (node[1] && node[1].href) {
        ipfsURIs.shift();
        ipfsURIs.push(node[1].href);
        archived.pop();
      }
      ++counter;
    }
  }

  return archived;
};
