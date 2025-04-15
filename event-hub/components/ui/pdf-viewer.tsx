'use client';

import { useState } from 'react';
import { ExternalLinkIcon, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface PDFViewerProps {
  url: string;
  fileName: string;
  onRefresh?: () => Promise<string>;
}

export function PDFViewer({ url, fileName, onRefresh }: PDFViewerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [loadError, setLoadError] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      const newUrl = await onRefresh();
      setCurrentUrl(newUrl);
      setLoadError(false);
    } catch (error) {
      console.error('Error refreshing PDF URL:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {loadError ? (
        <div className="p-4 border rounded bg-gray-50 text-center">
          <p className="text-sm text-gray-600 mb-2">The PDF could not be loaded.</p>
          {onRefresh && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <iframe
          src={`${currentUrl}#view=FitH`}
          className="w-full h-[300px] border rounded"
          title={fileName}
          onError={() => setLoadError(true)}
        />
      )}
      <div className="flex justify-end">
        <a 
          href={currentUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 flex items-center gap-1"
        >
          Open in new tab <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
} 