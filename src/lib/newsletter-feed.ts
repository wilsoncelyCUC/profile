const NEWSLETTER_RSS_URL = 'https://rss.beehiiv.com/feeds/1QQU1QTjnm.xml';
const MAX_ARTICLES = 10;
const EXCERPT_MAX_LENGTH = 140;

export type NewsletterArticle = {
  title: string;
  excerpt: string;
  link: string;
};

const stripCdata = (value: string) => value.replace(/^<!\[CDATA\[|\]\]>$/g, '');

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(parseInt(dec, 10)));

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ');

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const truncateText = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}...` : value;

const getTagValue = (block: string, tagName: string) => {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = block.match(pattern);

  if (!match?.[1]) {
    return '';
  }

  return normalizeText(decodeHtmlEntities(stripCdata(match[1])));
};

const parseItem = (itemXml: string): NewsletterArticle | null => {
  const title = getTagValue(itemXml, 'title');
  const link = getTagValue(itemXml, 'link');
  const description = getTagValue(itemXml, 'description');
  const excerpt = truncateText(normalizeText(stripHtml(description)), EXCERPT_MAX_LENGTH);

  if (!title || !link) {
    return null;
  }

  return {
    title,
    link,
    excerpt,
  };
};

const parseRssItems = (xml: string): NewsletterArticle[] => {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks
    .map((itemXml) => parseItem(itemXml))
    .filter((item): item is NewsletterArticle => Boolean(item))
    .slice(0, MAX_ARTICLES);
};

export const getNewsletterFeed = async (): Promise<NewsletterArticle[]> => {
  try {
    const response = await fetch(NEWSLETTER_RSS_URL);

    if (!response.ok) {
      console.warn(`Unable to fetch newsletter RSS feed. Status: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRssItems(xml);
  } catch (error) {
    console.warn('Unable to fetch newsletter RSS feed.', error);
    return [];
  }
};
