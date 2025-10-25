# Charadex Routes Documentation

## Pages

### `/` - Home Page
- Displays the character grid with 2000 most common Chinese characters
- Characters are colored based on whether they've been seen (caught)
- Clicking any character navigates to its detail page

### `/character/[char]` - Character Detail Page

**Example**: `/character/不`

**Displays**:
- Large character display with pinyin
- Statistics:
  - Times seen
  - Frequency rank (from hanziDB)
  - HSK level
  - Stroke count
- Character details:
  - Radical and radical code
  - English definition
- List of all words containing this character (clickable links)

**Data Source**:
- User data from `data.json` (seen count, word references)
- Static data from `hanziDB.json` (pinyin, definition, frequency, HSK level, etc.)

### `/word/[word]` - Word Detail Page

**Example**: `/word/我的`

**Displays**:
- Large word display
- English translation/meaning
- Statistics:
  - Times seen
  - Number of sentences containing this word
- Characters that make up the word (clickable links to character pages)
- All sentences containing this word with:
  - Full sentence text
  - Source URL (clickable external link)

**Data Source**:
- User data from `data.json`

## API Routes

### `GET /api/characters`
Returns array of all 2000 characters with their data.

**Response**:
```json
[
  {
    "character": "的",
    "seenCount": 15,
    "pinyin": "de",
    "wordReferences": ["word-id-1", "word-id-2"]
  }
]
```

### `GET /api/character/[char]`
Returns detailed information about a specific character.

**Example**: `/api/character/不`

**Response**:
```json
{
  "character": "不",
  "seenCount": 10,
  "pinyin": "bù",
  "wordReferences": ["word-id-1"],
  "hanziData": {
    "frequency_rank": "4",
    "definition": "no, not; un-; negative prefix",
    "radical": "一",
    "radical_code": "1.3",
    "stroke_count": "4",
    "hsk_level": "1"
  },
  "words": [
    {
      "id": "word-id-1",
      "word": "不好",
      "meaning": "not good, bad",
      "seenCount": 3
    }
  ]
}
```

### `GET /api/word/[word]`
Returns detailed information about a specific word.

**Example**: `/api/word/不好`

**Response**:
```json
{
  "id": "word-id-1",
  "word": "不好",
  "meaning": "not good, bad",
  "seenCount": 3,
  "sentences": [
    {
      "id": "sent-id-1",
      "text": "这个不好。",
      "source": "https://example.com/article"
    }
  ],
  "characters": [
    {
      "character": "不",
      "pinyin": "bù"
    },
    {
      "character": "好",
      "pinyin": "hǎo"
    }
  ]
}
```

### `POST /api/process_text`
Processes captured Chinese text from the Chrome extension.

**Request Body**:
```json
{
  "text": "这是我的书。",
  "url": "https://example.com/page"
}
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "sentences": 1,
    "words": 4,
    "characters": 5
  }
}
```

## Navigation Flow

```
Character Grid (/)
    ↓ (click character)
Character Detail (/character/的)
    ↓ (click word)
Word Detail (/word/我的)
    ↓ (click sentence source)
External website ↗

Word Detail (/word/我的)
    ↓ (click character in word)
Character Detail (/character/我)
```

## URL Encoding

All dynamic routes properly handle URL encoding for Chinese characters:
- Characters and words are encoded using `encodeURIComponent()`
- API routes decode them using `decodeURIComponent()`

## Styling

- **Character pages**: Blue/indigo theme
- **Word pages**: Purple/pink theme
- **Grid**: Responsive grid layout
- All pages support dark mode
