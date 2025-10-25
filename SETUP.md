# Charadex Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd webapp
npm install
```

### 2. Configure Anthropic API

Create a `.env.local` file in the `webapp` directory:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

**How to get your API key:**
1. Visit the [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### 3. Start the Development Server

```bash
cd webapp
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Install the Chrome Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `extension` folder

**Note**: The extension needs placeholder icons. Create these files in the `extension` folder:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Or the extension will show warnings (but still work).

## Testing the Extension

1. Visit a webpage with Chinese text (e.g., a Chinese news site)
2. Select some Chinese text
3. Right-click and choose "Capture in Charadex"
4. You should see a notification
5. Go back to localhost:3000 to see the captured characters highlighted

## Troubleshooting

### "Failed to connect to Charadex"

- Make sure the webapp is running on localhost:3000
- Check browser console for CORS errors

### "Anthropic API error"

- Verify your API key is correct in `.env.local`
- Ensure your API key has sufficient credits
- Check the model name in `webapp/lib/ai-processor.ts`

### Characters not showing

- Check that `hanziDB.json` exists in the root directory
- Verify the path in `webapp/lib/common-characters.ts` (line 23)

### Extension not appearing in context menu

- Reload the extension in `chrome://extensions/`
- Try selecting text again
- Check the extension background console for errors

## Development

### Running Tests

```bash
cd webapp
npm run build  # Test if everything compiles
```

### Checking the Data

Your captured data is stored in:
```
webapp/lib/data.json
```

You can inspect this file to see:
- Characters you've encountered
- Words that have been captured
- Sentences and their sources

### Modifying the Character Count

Edit `webapp/lib/common-characters.ts`:

```typescript
// Change 2000 to any number up to the size of hanziDB
export const COMMON_CHARACTERS = getCommonCharacters(500);  // Show 500 characters
```

## Production Deployment

### Deploy Webapp

You can deploy to Vercel:

```bash
cd webapp
vercel deploy
```

### Update Extension for Production

Edit `extension/background.js` and change:

```javascript
const CHARADEX_API = 'https://your-production-url.com/api/process_text';
```

Then create a production build and publish to Chrome Web Store.

## Next Steps

1. Set up Anthropic API key
2. Test capturing Chinese text
3. Explore the character grid
4. Check out the [README.md](README.md) for more features
