const path = require('path');
const XLSX = require('xlsx');

// Load and cache the Excel dataset once at startup
const DATASET_PATH = path.join(__dirname, '..', '..', 'Resource Dataset.xlsx');

let cachedResources = null;

function loadDataset() {
  if (cachedResources) return cachedResources;

  try {
    const workbook = XLSX.readFile(DATASET_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    cachedResources = rows
      .map((row) => {
        // Normalise keys by lowercasing
        const entries = Object.entries(row).reduce((acc, [key, value]) => {
          acc[key.toLowerCase()] = value;
          return acc;
        }, {});

        const domain = String(entries['domain'] || 'any').trim().toLowerCase();
        const topicCell = entries['topic'] || entries['topics'] || '';
        const videoUrl = String(entries['video resource'] || entries['video'] || '').trim();
        const theoryUrl = String(entries['theory resource'] || entries['theory'] || entries['doc'] || '').trim();

        const topics = String(topicCell || '')
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        if (!topics.length || (!videoUrl && !theoryUrl)) {
          return null;
        }

        return {
          domain,
          topics,
          videoUrl,
          theoryUrl,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error('Failed to load Resource Dataset.xlsx:', err.message);
    cachedResources = [];
  }

  return cachedResources;
}

function getDatasetResources(domain) {
  const all = loadDataset();
  const norm = String(domain || '').trim().toLowerCase();
  return all.filter((r) => r.domain === norm || r.domain === 'any' || r.domain === 'all');
}

module.exports = {
  getDatasetResources,
};

