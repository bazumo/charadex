"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all words, occurrences, and sentences? This action cannot be undone. Character data will be reset but not deleted.')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/clear_data', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to clear data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while clearing data' });
      console.error('Error:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white dark:bg-black">
      <PageHeader />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="container mx-auto px-8 py-12 max-w-3xl">
          <h1 className="text-4xl font-light mb-8">Settings</h1>

          {/* Data Management Section */}
          <div className="mb-12">
            <h2 className="text-xl font-light mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
              Data Management
            </h2>

            <div className="space-y-6">
              {/* Clear Data */}
              <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Clear All Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Remove all captured words, word occurrences, and sentences. Character data will be reset but not deleted.
                  This action cannot be undone.
                </p>

                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isClearing ? 'Clearing...' : 'Clear All Data'}
                </button>

                {message && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Other Settings */}
          <div className="mb-12">
            <h2 className="text-xl font-light mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
              About
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>Charadex - A Pokedex-like application for learning Chinese characters</p>
              <p>Capture Chinese text from web pages and track your character learning progress.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
