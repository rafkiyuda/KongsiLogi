const fs = require('fs');
const path = require('path');
const https = require('https');

const products = [
  { name: 'bayam', query: 'Spinach' },
  { name: 'kangkung', query: 'Water_spinach' },
  { name: 'sawiputih', query: 'Napa_cabbage' },
  { name: 'selada', query: 'Lettuce' },
  { name: 'cabaimerah', query: 'Chili_pepper' },
  { name: 'cabairawit', query: 'Bird%27s_eye_chili' },
  { name: 'tomat', query: 'Tomato' },
  { name: 'wortel', query: 'Carrot' },
  { name: 'brokoli', query: 'Broccoli' },
  { name: 'buncis', query: 'Green_bean' },
  { name: 'kol', query: 'Cabbage' },
  { name: 'daunbawang', query: 'Scallion' }
];

async function fetchWikiImage(query) {
  return new Promise((resolve, reject) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=400`;
    const options = {
      headers: { 'User-Agent': 'KongsiLogi/1.0 (test@example.com)' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  for (const p of products) {
    console.log(`Fetching ${p.name}...`);
    const imgUrl = await fetchWikiImage(p.query);
    if (imgUrl) {
      console.log(`Downloading ${imgUrl} to ${p.name}.jpg`);
      await downloadImage(imgUrl, path.join(__dirname, 'public', 'images', `${p.name}.jpg`));
    } else {
      console.log(`No image found for ${p.name}`);
    }
  }
}

main();
