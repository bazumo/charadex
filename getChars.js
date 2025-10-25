#!/usr/bin/env node

const https = require('https');

const CSV_URL = 'https://raw.githubusercontent.com/ruddfawcett/hanziDB.csv/master/hanziDB.csv';

function fetchCharacters() {
  https.get(CSV_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const lines = data.trim().split('\n');
      const characters = [];
      
      // Skip header line and process rows
      for (let i = 1; i < lines.length && i <= 2000; i++) {
        const columns = lines[i].split(',');
        if (columns.length > 1) {
          const char = columns[1].trim();
          if (char) {
            characters.push(char);
          }
        }
      }
      
      console.log(JSON.stringify(characters));
    });

  }).on('error', (err) => {
    console.error('Error fetching data:', err.message);
    process.exit(1);
  });
}

fetchCharacters();