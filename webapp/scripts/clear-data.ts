import { readData, writeData } from '../lib/storage';

console.log('🧹 Clearing all words, occurrences, and sentences...\n');

try {
  const data = readData();

  const beforeStats = {
    words: Object.keys(data.words || {}).length,
    occurrences: Object.keys(data.wordOccurrences || {}).length,
    sentences: Object.keys(data.sentences || {}).length,
    characters: Object.keys(data.characters || {}).length,
  };

  console.log('Before clearing:');
  console.log(`  Words: ${beforeStats.words}`);
  console.log(`  Occurrences: ${beforeStats.occurrences}`);
  console.log(`  Sentences: ${beforeStats.sentences}`);
  console.log(`  Characters: ${beforeStats.characters}`);
  console.log('');

  // Clear words, word occurrences, and sentences
  data.words = {};
  data.wordOccurrences = {};
  data.sentences = {};

  // Reset character seen counts and word references
  for (const char in data.characters) {
    data.characters[char].seenCount = 0;
    data.characters[char].wordReferences = [];
  }

  writeData(data);

  console.log('✅ Successfully cleared all data!');
  console.log('');
  console.log('After clearing:');
  console.log(`  Words: 0`);
  console.log(`  Occurrences: 0`);
  console.log(`  Sentences: 0`);
  console.log(`  Characters: ${beforeStats.characters} (metadata preserved, counts reset)`);
  console.log('');
  console.log('✨ Character database has been reset and is ready for new captures!');

} catch (error) {
  console.error('❌ Error clearing data:', error);
  process.exit(1);
}
