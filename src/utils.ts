export const isValidURL = (uri: string): boolean => {
  if (uri.length < 3) {
    return false;
  }

  try {
    new URL(uri);
  } catch (_) {
    return false;
  }

  return true;
};

export const createFileName = (uri: string): string => {
  if (uri.length < 3) {
    return 'unknow';
  }

  return decodeURI(uri)
    .replace(/http(s)?:\/\//gm, '')
    .replace(/\./g, '-')
    .replace(/\//g, '-')
    .slice(0, -1);
};

export const extractURI = (text: string, scope = 'orig'): string[] => {
  if (typeof text !== 'string' || text.length < 1) {
    return [];
  }

  const regex = {
    ia: /(?<=href=['"])https:\/\/web\.archive\.org\/web\/[0-9]+\/.*?(?=['"])/gm,
    is: /(?<=href=['"])https:\/\/archive\.[a-z]{2,5}\/[0-9a-zA-Z].*?(?=['"])/gm,
    ipfs: /(?<=href=['"])https:\/\/ipfs.io\/ipfs\/.*?(?=['"])/gm,
    orig: /href=['"]https:\/\/web\.archive\.org\/[save|web/0-9]+\/(.*?(?=['"]))/gm,
  };
  const re = regex[scope] || regex['orig'];
  const match = [...text.matchAll(re)];

  let url: string;
  let offset: number;
  const result: string[] = [];
  for (const m of match) {
    if (m.length === 0) {
      continue;
    }

    offset = m.length >= 2 ? m.length - 1 : 0;
    url = Reflect.has(m, offset) ? m[offset] : '';
    if (url.length > 0) {
      result.push(url);
    }
  }

  // Remove duplicate item from result
  return [...new Set(result)];
};

export const pageURL = (doc: Document): string => {
  let url = '';
  const node = doc.querySelector('head > meta[property="og:url"]');
  if (node) {
    url = node.getAttribute('content') || '';
    if (url.length > 0) {
      return url;
    }
  }

  return doc.URL;
};

export const pageTitle = (doc: Document): string => {
  let node;
  let title = '';
  node = doc.querySelector('head > meta[property="og:title"]');
  if (node) {
    title = node.getAttribute('content') || '';
    if (title.length > 0) {
      return title;
    }
  }
  node = doc.querySelector('title');

  return node ? node.innerHTML : '';
};
