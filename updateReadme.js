import fs from 'fs';
import axios from 'axios';
import xml2js from 'xml2js';

const SITEMAP_URL = 'https://luanestradioto.com/sitemap.xml';
const README_PATH = 'README.md';

async function fetchSitemap() {
  const response = await axios.get(SITEMAP_URL);
  return response.data;
}

function parseSitemap(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) reject(err);
      const urls = result.urlset.url.map(entry => ({
        url: entry.loc[0],
        title: entry["news:news"] ? entry["news:news"][0]["news:title"][0] : null
      }));
      resolve(urls);
    });
  });
}

function formatNewsItems(urls) {
  return urls.slice(0, 4).map(entry => `- [${entry.title}](${entry.url})`).join('\n');
}

function updateReadme(newsItems) {
  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
  const updatedContent = readmeContent.replace(
    /<!-- START POSTS -->[\s\S]*<!-- END POSTS -->/,
    `<!-- START POSTS -->\n${newsItems}\n<!-- END POSTS -->`
  );
  fs.writeFileSync(README_PATH, updatedContent);
}

async function main() {
  try {
    const sitemapXml = await fetchSitemap();
    const urls = await parseSitemap(sitemapXml);
    const newsItems = formatNewsItems(urls);
    updateReadme(newsItems);
  } catch (error) {
    console.error('Error updating README:', error);
  }
}

main();