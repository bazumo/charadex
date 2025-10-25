// Create context menu on extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'captureInCharadex',
    title: 'Capture in Charadex',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'captureInCharadex') {
    const selectedText = info.selectionText;
    const url = tab.url;

    if (selectedText && url) {
      // Send the selected text to the Charadex webapp
      sendToCharadex(selectedText, url);
    }
  }
});

async function sendToCharadex(text, url) {
  const CHARADEX_API = 'http://localhost:3000/api/process_text';

  try {
    const response = await fetch(CHARADEX_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        url: url
      })
    });

    const result = await response.json();

    if (result.success) {
      // Show success notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Charadex',
        message: `Captured! Found ${result.stats.sentences} sentences, ${result.stats.words} words, and ${result.stats.characters} characters.`
      });
    } else {
      console.error('Failed to send to Charadex:', result.error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Charadex Error',
        message: 'Failed to capture text. Make sure Charadex is running on localhost:3000.'
      });
    }
  } catch (error) {
    console.error('Error sending to Charadex:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Charadex Error',
      message: 'Failed to connect to Charadex. Make sure it is running on localhost:3000.'
    });
  }
}
