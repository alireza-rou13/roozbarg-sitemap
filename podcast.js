const axios = require('axios');
const fs = require('fs');
const { js2xml } = require('xml-js');

const allpodcasts = [];

async function fetchPodcastsParents() {
  try {
    const response = await axios.get('http://api.atf.morsalat.ir/v1/podcasts?search=parent:0');
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchPodcastsByParentId(parentId) {
  try {
    const response = await axios.get(`http://api.atf.morsalat.ir/v1/podcasts?parent=${parentId}`);
    return response.data.data;
  } catch (error) {
    console.error(error);
  }
}

async function getPodcasts() {
  const parents = await fetchPodcastsParents();
  for (const parent of parents) {
    const podcasts = await fetchPodcastsByParentId(parent.id);
    podcasts.forEach(podcast => {
      allpodcasts.push(podcast);
    });
  }

  const xmlObj = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    urlset: {
      _attributes: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      },
      url: allpodcasts.map(podcast => {
        const lastmod = new Date(podcast.timestamp*1000).toISOString();
        return {
          loc: {
            _text: `http://ruzbarg.morsalat.ir/podcast/${podcast.id}`
          },
          lastmod: {
            _text: lastmod
          },
          priority: {
            _text: '0.7'
          }
        };
      })
    }
  };

  const xml = js2xml(xmlObj, { compact: true, spaces: 2 });

  fs.writeFile('podcasts.xml', xml, err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Podcasts generated successfully!');
  });
}

getPodcasts();