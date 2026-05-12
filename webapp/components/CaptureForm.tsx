'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDataStore, storeProcessedData } from '@/lib/client-storage';

interface CaptureFormProps {
  onCapture?: () => void;
}

interface CaptureResult {
  type: 'success' | 'error';
  text: string;
  words?: { word: string; meaning: string }[];
  characters?: string[];
}

export default function CaptureForm({ onCapture }: CaptureFormProps) {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/process_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), url: 'demo-input' }),
      });

      const apiResult = await response.json();

      if (!response.ok) {
        setResult({ type: 'error', text: apiResult.error || 'Failed to process text' });
        return;
      }

      const data = getDataStore();
      if (data) {
        storeProcessedData(data, apiResult.processed, 'demo-input');
      }

      setResult({
        type: 'success',
        text: `Caught ${apiResult.processed.characters.length} characters, ${apiResult.processed.words.length} words, ${apiResult.processed.sentences.length} sentences`,
        words: apiResult.processed.words,
        characters: apiResult.processed.characters,
      });
      setText('');
      onCapture?.();
    } catch {
      setResult({ type: 'error', text: 'Failed to connect to server' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        Capture Text
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-light">Capture Chinese Text</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-black dark:hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {!result?.words && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste Chinese text here..."
              className="w-full h-32 p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 text-base"
              disabled={isProcessing}
            />

            {isProcessing && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Analyzing text...
              </div>
            )}
          </>
        )}

        {result && result.type === 'error' && (
          <div className="mt-3 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
            {result.text}
          </div>
        )}

        {result && result.type === 'success' && result.words && (
          <div className="space-y-4">
            {result.characters && result.characters.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Characters ({result.characters.length})
                </h3>
                <div className="flex flex-wrap gap-1">
                  {result.characters.map((char) => (
                    <Link
                      key={char}
                      href={`/character/${encodeURIComponent(char)}`}
                      onClick={handleClose}
                      className="w-10 h-10 flex items-center justify-center text-lg bg-black text-white dark:bg-white dark:text-black rounded hover:opacity-70 transition-opacity"
                    >
                      {char}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.words.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Words ({result.words.length})
                </h3>
                <div className="space-y-1">
                  {result.words.map((w, i) => (
                    <Link
                      key={i}
                      href={`/word/${encodeURIComponent(w.word)}`}
                      onClick={handleClose}
                      className="flex justify-between items-baseline py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 -mx-1 px-1 rounded transition-colors"
                    >
                      <span className="text-base">{w.word}</span>
                      <span className="text-sm text-gray-500 ml-3 text-right">{w.meaning}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          {result?.words ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !text.trim()}
                className="px-4 py-2 text-sm bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {isProcessing ? 'Processing...' : 'Capture'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
