import cheerio from 'cheerio';

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
    .replace(/https?:\/\//gm, '')
    .replace(/\./g, '-')
    .replace(/\//g, '-')
    .slice(0, -1);
};

export const extractURI = (text: string, scope = 'orig'): string[] => {
  if (typeof text !== 'string' || text.length < 1) {
    return [];
  }

  const regex = {
    ia: /(?<=href=['"])https?:\/\/web\.archive\.org\/web\/[0-9]+\/.*?(?=['"])/gm,
    is: /(?<=href=['"])https?:\/\/archive\.[a-z]{2,5}\/[0-9a-zA-Z].*?(?=['"])/gm,
    ph: /(?<=href=['"])https?:\/\/telegra\.ph\/\S+(?=['"])/gm,
    ip: /(?<=href=['"])https?:\/\/ipfs\.io\/ipfs\/\w+(?=['"])/gm,
    orig: /href=['"]https?:\/\/web\.archive\.org\/(?:\*|save\/_embed|save|web\/\d+)\/(.+?(?=['"]))/gm,
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

export const pageURL = ($: cheerio.Root): string => {
  const url = $('head > meta[property="og:url"]').attr('content');
  if (url && typeof url === 'string') {
    return url;
  }

  return '';
};

export const pageTitle = ($: cheerio.Root): string => {
  const title = $('head > meta[property="og:title"]').attr('content');
  if (title && typeof title === 'string') {
    return title;
  }

  return $('title').text() || '';
};

export const pageMissing = ($: cheerio.Root): boolean => {
  // mp.weixin.qq.com
  if ($('.weui-msg__icon-area').html()) {
    return true;
  }

  // douban.com/people/\d+/status/\d+/
  if ($('#f3s').html()) {
    return true;
  }

  return false;
};

const sanitize = (str: string) => {
  if (typeof str !== 'string') {
    return str;
  }

  str = str.replace(/"<>#%\{\}\|\\\^~\[\]`;\?:@=&/g, '').replace(/:\/\/|\//g, '-');

  return Buffer.from(str).toString('utf8');
};

export const createFilename = (uri: string, title: string): string => {
  const extension = 'html';
  let filename = `unknown.${extension}`;
  let url: URL;

  if (!uri || typeof uri != 'string' || uri.length === 0) {
    return filename;
  }

  if (typeof title === 'string') {
    title = title.replace(/\n|\r|\r\n/gm, '').trim();
  }

  try {
    url = new URL(decodeURI(uri));
  } catch (_) {
    return sanitize(`${uri.replace(/\./g, '-')}-${title}.${extension}`);
  }

  const hostname = url.hostname
    .replace(/\./g, '-')
    .replace(/www-/, '')
    .replace(/^-+|-+$/gm, '');

  if (url.pathname.length < 1) {
    filename = `${hostname}-${title}`.substring(0, 95);
    return sanitize(`${filename}.{extension}`);
  }

  const pathname = url.pathname.replace(/:\/\/|\/|\./g, '-').replace(/^-+|-+$/gm, '');
  let fullpath = `${hostname}-${pathname}-${title}`.replace(/^-+|-+$/gm, '').substring(0, 95);
  if (url.search.length > 0) {
    // Prevent overriding the results of different query
    fullpath += Buffer.from(url.search).toString('base64').substr(-14, 12);
  }

  return sanitize(`${fullpath}.${extension}`);
};
