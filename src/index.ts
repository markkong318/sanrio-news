// import 'url-polyfill'
import hello from "./hello";



const main = () => {
  hello();
};

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

  const response = UrlFetchApp.fetch('https://www.sanrio.co.jp/api/friends/get_news/', options);
  const responseCode = response.getResponseCode()

  if (responseCode !== 200) {
    return ContentService
      .createTextOutput('Could not get sanrio news api');
  }

  const responseText = response.getContentText()
  const posts = JSON.parse(responseText);

  const document = XmlService.parse(`<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"xmlns:dc="http://purl.org/dc/elements/1.1/"></rss>`);
  const root = document.getRootElement();

  const channel = XmlService.createElement('channel');
  root.addContent(channel)

  const title = XmlService.createElement('title')
  title.setText('Sanrio news');
  channel.addContent(title);

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

    const date = XmlService.createElement('date')
    date.setText(post.public_date);
    item.addContent(date);

    const image = XmlService.createElement('image')
    image.setText(post.thumbnail);
    item.addContent(image);
  }

  // for (let i = 0; i < posts.data.length; i++) {
  //   const post = posts.data[i];
  //
  //   feed.addItem({
  //     title: post.title,
  //     id: post.url,
  //     link: post.url,
  //     date: new Date(post.public_date),
  //     image: post.thumbnail,
  //   });
  // }
  //
  // const rss = feed.rss2();

  // var RSS = require('rss');

  // const rss = createXml()
  //
  // console.log(rss)

  const xml = XmlService.getPrettyFormat().format(document);
  console.log(xml);

  return ContentService
    .createTextOutput(xml)
    .setMimeType(ContentService.MimeType.JSON);

  // var name = 'aaa'; // (2)
  // var greeting = name + "さん、こんにちは";
  //
  // var json = { // (3)
  //   greeting:greeting
  // }
  //
  // return ContentService
  //   .createTextOutput(JSON.stringify(json)) // (4)
  //   .setMimeType(ContentService.MimeType.JSON); // (5)
}


function createXml() {
  var document = XmlService.parse(`<rss version="2.0"
 xmlns:content="http://purl.org/rss/1.0/modules/content/"
 xmlns:dc="http://purl.org/dc/elements/1.1/"></rss>`); // let root = XmlService.createElement('rss');

  var root = document.getRootElement();

  let channel = XmlService.createElement('channel');
  root.addContent(channel);

  let xml = XmlService.getPrettyFormat().format(document);
  console.log(xml);
  return xml;
}
