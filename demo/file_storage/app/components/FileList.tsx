// app/components/FileList.tsx
'use client';

import { useEffect, useState } from 'react';

interface FileItem {
  name: string;
  url: string;
}

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(setFiles);
  }, []);

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 my-6">
      <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
      {files.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-4">
          {files.map(file => (
            <li key={file.name} className="border-b pb-4">
              <a
                href={file.url}
                target="_blank"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                📎 {file.name}
              </a>
              {file.name.match(/\.(jpg|jpeg|png|gif)$/i) && (
                <img
                  src={file.url}
                  alt={file.name}
                  className="mt-2 rounded shadow-sm max-h-60"
                />
              )}
              {file.name.endsWith('.pdf') && (
                <embed
                  src={file.url}
                  type="application/pdf"
                  width="100%"
                  height="400px"
                  className="mt-2 rounded shadow-sm"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}