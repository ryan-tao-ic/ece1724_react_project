/**
 * Class representing errors that occur during storage operations
 */
export class StorageError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'StorageError';
  }
} 