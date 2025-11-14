# Charadex


[![Charadex Demo](https://img.youtube.com/vi/CwTEyKz6p7E/0.jpg)](https://www.youtube.com/watch?v=CwTEyKz6p7E)

A Pokedex-like application for learning Chinese characters. Catch and track Chinese characters as you browse the web!

## Features

- **Character Grid**: View 2000 most common Chinese characters with pinyin
- **HanziDB Integration**: Uses comprehensive character database with frequency, pinyin, and definitions
- **Chrome Extension**: Capture Chinese text from any webpage with a right-click
- **AI-Powered Processing**: Uses Anthropic Claude Sonnet 4 to analyze Chinese text
- **Automatic Tracking**: Tracks character usage, words, and sentences
- **Progress Visualization**: See which characters you've encountered and how often

## Project Structure

```
charadex/
├── hanziDB.json               # Character database (frequency, pinyin, definitions)
├── webapp/                    # Next.js React TypeScript application
│   ├── app/
│   │   ├── api/
│   │   │   ├── characters/    # API to get character data
│   │   │   └── process_text/  # API to process captured text
│   │   └── page.tsx           # Main page with character grid
│   ├── components/
│   │   └── CharacterGrid.tsx  # Character grid component
│   └── lib/
│       ├── types.ts           # TypeScript type definitions
│       ├── storage.ts         # JSON file storage utilities
│       ├── data.json          # Data storage (characters, words, sentences)
│       ├── common-characters.ts # Loads 2000 characters from hanziDB
│       └── ai-processor.ts    # AI text processing with Anthropic API
│
└── extension/                 # Chrome extension
    ├── manifest.json          # Extension configuration
    ├── background.js          # Background service worker
    └── README.md              # Extension installation guide
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key
- Chrome browser (for the extension)

### 1. Install Webapp

```bash
cd webapp
npm install
```

### 2. Configure Anthropic API

Create a `.env.local` file in the `webapp` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

To get your API key, visit the [Anthropic Console](https://console.anthropic.com/) and create a new API key.

### 3. Run the Webapp

```bash
cd webapp
npm run dev
```

The webapp will be available at `http://localhost:3000`

### 4. Install Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `extension` folder from this repository

**Note**: You'll need to create icon files for the extension:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Usage

1. **Start the webapp**: Make sure it's running on `http://localhost:3000`
2. **Browse Chinese content**: Go to any webpage with Chinese text
3. **Select text**: Highlight the Chinese text you want to capture
4. **Right-click**: Select "Capture in Charadex" from the context menu
5. **View progress**: Return to the webapp to see your captured characters

## Data Model

### Characters Table
- `character`: The Chinese character
- `seenCount`: Number of times the character has been encountered
- `pinyin`: Pronunciation in pinyin
- `wordReferences`: IDs of words containing this character

### Words Table
- `id`: Unique identifier
- `word`: Chinese word
- `meaning`: English translation
- `seenCount`: Number of times encountered
- `sentenceReferences`: IDs of sentences containing this word

### Sentences Table
- `id`: Unique identifier
- `text`: Chinese sentence
- `wordIds`: IDs of words in this sentence
- `source`: URL where the sentence was found

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Anthropic API (Claude Sonnet 4)
- **Storage**: JSON file (temporary, can be migrated to database)
- **Extension**: Chrome Extension Manifest V3

## Future Enhancements

- [x] Integrate 2000 most common characters with pinyin data
- [ ] Add character detail view with etymology, radical, and HSK level
- [ ] Implement user authentication for multi-user support
- [ ] Migrate from JSON to proper database (PostgreSQL/MongoDB)
- [ ] Create statistics dashboard with learning progress
- [ ] Add export functionality for study materials (Anki decks, etc.)
- [ ] Support for traditional Chinese characters
- [ ] Click on character to see all words and sentences containing it
- [ ] Add audio pronunciation for characters and words
- [ ] Mobile app version

## Development Notes

- The character grid displays 2000 most common Chinese characters loaded from `hanziDB.json`
- Character data includes frequency rank, pinyin, definitions, and HSK level
- Anthropic API key is required for text processing
- The extension only works with localhost:3000 by default (can be configured for production)
- All user data is stored in `webapp/lib/data.json`

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!
