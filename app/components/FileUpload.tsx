// app/components/FileUpload.tsx
'use client';

import { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/files', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setMessage(data.success ? '✅ Upload successful!' : `❌ ${data.error}`);
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 my-6">
      <h2 className="text-xl font-semibold mb-4">Upload a File (Max 1MB)</h2>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}