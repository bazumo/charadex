# Charadex Quick Start

## 🚀 Get Running in 3 Steps

### 1. Install & Configure

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your Anthropic API key
```

### 2. Start the Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Load the Extension

1. Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. "Load unpacked" → select `../extension` folder

## 🎯 Test It

1. Visit a Chinese website (e.g., Baidu, Chinese Wikipedia)
2. Select some Chinese text
3. Right-click → "Capture in Charadex"
4. Check localhost:3000 - captured characters are now highlighted!

## 📁 Key Files

```
webapp/
├── app/page.tsx              # Main UI
├── components/CharacterGrid  # Character display
├── lib/
│   ├── ai-processor.ts      # Anthropic API integration
│   ├── common-characters.ts # Loads hanziDB
│   ├── storage.ts           # Data persistence
│   └── data.json            # Your captured data
└── app/api/
    ├── characters/          # GET character data
    └── process_text/        # POST to process text
```

## 🔧 Environment Variables

Required in `.env.local`:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/).

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not working | Ensure webapp is running on port 3000 |
| Anthropic API errors | Check API key in `.env.local` and credits |
| Characters not loading | Verify `../../hanziDB.json` exists |
| Build fails | Run `npm install` again |

## 📊 Default Configuration

- **Characters displayed**: 2000 (most common)
- **AI Model**: Claude Sonnet 4 (Anthropic API)
- **Storage**: JSON file (`lib/data.json`)
- **Port**: 3000

## 🎨 Customization

Change character count in `lib/common-characters.ts`:
```typescript
export const COMMON_CHARACTERS = getCommonCharacters(500); // Show 500
```

Change API endpoint in `../extension/background.js`:
```javascript
const CHARADEX_API = 'https://your-domain.com/api/process_text';
```

---

**Ready to catch some characters!** 🇨🇳✨
