// @ts-ignore
const doGet = (e: { parameter: { page: number; count: number; news: string; character: string; }; }) => {
  const page = e?.parameter?.page || 1;
  const count = e?.parameter?.count || 20;
  const news = e?.parameter?.news || 'all';
  const character = e?.parameter?.character || 'all';

  const options = {
    method: 'post',
    payload: {
      page,
      count,
      news,
      character,
    }
  };

  // @ts-ignore
  const response = UrlFetchApp.fetch('https://www.sanrio.co.jp/api/friends/get_news/', options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    return ContentService
      .createTextOutput('Could not get sanrio news api');
  }

  const responseText = response.getContentText()
  const posts = JSON.parse(responseText);

  const document = XmlService.parse(`<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/"></rss>`);
  const root = document.getRootElement();

  const channel = XmlService.createElement('channel');
  root.addContent(channel)

  const title = XmlService.createElement('title')
  title.setText('サンリオ');
  channel.addContent(title);

  const description = XmlService.createElement('description')
  description.setText('ニュース・イベント');
  channel.addContent(description);


  const link = XmlService.createElement('link')
  link.setText('https://www.sanrio.co.jp/news/');
  channel.addContent(link);

  for (let i = 0; i < posts.data.length; i++) {
    const post = posts.data[i];

    const item = XmlService.createElement('item')
    channel.addContent(item);

    const title = XmlService.createElement('title')
    title.setText(post.title);
    item.addContent(title);

    const link = XmlService.createElement('link')
    link.setText(post.url);
    item.addContent(link);

    const guid = XmlService.createElement('guid')
    guid.setText(post.url);
    item.addContent(guid);

    const pubDate = XmlService.createElement('pubDate')
    pubDate.setText((new Date(post.public_date)).toUTCString());
    item.addContent(pubDate);

    const category = XmlService.createElement('category')
    switch (post.news_category) {
      case 'goods':
        category.setText('グッズ');
        break;
      case 'atarikuji':
        category.setText('当りくじ');
        break;
      case 'eventcafe':
        category.setText('イベント&カフェ');
        break;
      case 'sweets':
        category.setText('スイーツ');
        break;
      case 'campaign':
        category.setText('キャンペーン');
        break;
      case 'smartphone':
        category.setText('スマホ向け');
        break;
      case 'sanrioplus':
        category.setText('Sanrio＋');
        break;
      case 'others':
        category.setText('その他');
        break;
      default:
        category.setText(post.news_category);
    }
    item.addContent(category);

    const description = XmlService.createElement('description')
    const cdata = XmlService.createCdata(`<img align="left" hspace="5" src="${post.thumbnail}"/>`);
    description.addContent(cdata);
    item.addContent(description);
  }

  const xml = XmlService.getPrettyFormat().format(document);
  console.log(xml);

  return ContentService
    .createTextOutput(xml)
    .setMimeType(ContentService.MimeType.JSON);
}
