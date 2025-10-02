import { UploadItem } from '@/components/ImageUploadProgress';

export interface UploadQueueService {
  addToQueue: (propertyId: string, files: File[]) => void;
  getQueueStatus: () => UploadItem[];
  onProgressUpdate: (callback: (uploads: UploadItem[]) => void) => void;
  onImageUploaded: (callback: (propertyId: string, imageUrls: string[]) => void) => void;
  retryUpload: (uploadId: string) => void;
  cancelUpload: (uploadId: string) => void;
}

class UploadQueue implements UploadQueueService {
  private uploads: Map<string, UploadItem> = new Map();
  private progressCallbacks: Set<(uploads: UploadItem[]) => void> = new Set();
  private imageUploadedCallbacks: Set<(propertyId: string, imageUrls: string[]) => void> = new Set();
  private activeUploads = 0;
  private readonly MAX_CONCURRENT = 3;

  addToQueue(propertyId: string, files: File[]) {
    console.log('Adding files to upload queue:', {
      propertyId,
      fileCount: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    files.forEach((file, index) => {
      const uploadId = `${propertyId}-${Date.now()}-${index}`;
      const uploadItem: UploadItem = {
        id: uploadId,
        file,
        progress: 0,
        status: 'pending'
      };

      console.log('Added to queue:', { uploadId, fileName: file.name });
      this.uploads.set(uploadId, uploadItem);
    });

    console.log('Total items in queue:', this.uploads.size);
    this.notifyProgressUpdate();
    this.processQueue(propertyId);
  }

  getQueueStatus(): UploadItem[] {
    return Array.from(this.uploads.values());
  }

  onProgressUpdate(callback: (uploads: UploadItem[]) => void) {
    this.progressCallbacks.add(callback);

    // Return cleanup function
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  onImageUploaded(callback: (propertyId: string, imageUrls: string[]) => void) {
    this.imageUploadedCallbacks.add(callback);

    // Return cleanup function
    return () => {
      this.imageUploadedCallbacks.delete(callback);
    };
  }

  retryUpload(uploadId: string) {
    const upload = this.uploads.get(uploadId);
    if (upload) {
      upload.status = 'pending';
      upload.progress = 0;
      upload.error = undefined;
      this.notifyProgressUpdate();

      // Extract propertyId from uploadId
      const propertyId = uploadId.split('-')[0];
      this.processQueue(propertyId);
    }
  }

  cancelUpload(uploadId: string) {
    this.uploads.delete(uploadId);
    this.notifyProgressUpdate();
  }

  private async processQueue(propertyId: string) {
    if (this.activeUploads >= this.MAX_CONCURRENT) return;

    const pendingUploads = Array.from(this.uploads.values())
      .filter(upload => upload.status === 'pending' && upload.id.startsWith(propertyId));

    for (const upload of pendingUploads) {
      if (this.activeUploads >= this.MAX_CONCURRENT) break;

      this.activeUploads++;
      this.uploadFile(propertyId, upload);
    }
  }

  private async uploadFile(propertyId: string, upload: UploadItem) {
    try {
      upload.status = 'uploading';
      this.notifyProgressUpdate();

      console.log('Starting upload for property:', propertyId, 'file:', upload.file.name);

      const formData = new FormData();
      formData.append('images', upload.file); // Changed from 'image' to 'images'
      formData.append('propertyId', propertyId);

      console.log('FormData prepared:', {
        fileName: upload.file.name,
        fileSize: upload.file.size,
        fileType: upload.file.type,
        mimeType: upload.file.type,
        extension: upload.file.name.split('.').pop(),
        propertyId
      });

      // Additional MIME type debugging
      if (!upload.file.type || upload.file.type === '') {
        console.warn('File has no MIME type, this may cause backend rejection:', upload.file.name);
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          upload.progress = Math.round((event.loaded / event.total) * 100);
          this.notifyProgressUpdate();
        }
      };

      const uploadPromise = new Promise<void>((resolve, reject) => {
        // Set timeout to 15 seconds
        const timeoutId = setTimeout(() => {
          xhr.abort();
          reject(new Error('Upload timeout - please try again'));
        }, 15000);

        xhr.onload = () => {
          clearTimeout(timeoutId);
          console.log('Upload response received:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText
          });

          if (xhr.status === 200 || xhr.status === 201) {
            console.log('Upload successful for:', upload.file.name);

            // Parse the response to get the uploaded image URLs
            try {
              const response = JSON.parse(xhr.responseText);
              console.log('Upload response data:', response);

              // The response should contain the uploaded image URL
              if (response.success && response.data && response.data.images) {
                console.log('Images uploaded successfully:', response.data.images);

                // Now we need to update the property with the new image URLs
                // This will be handled by a callback function
                this.notifyImageUploaded(propertyId, response.data.images);
              }

              upload.status = 'completed';
              upload.progress = 100;
              resolve();
            } catch (e) {
              console.error('Failed to parse success response:', xhr.responseText);
              upload.status = 'completed';
              upload.progress = 100;
              resolve();
            }
          } else {
            let errorMessage = `Upload failed: ${xhr.status}`;
            try {
              const response = JSON.parse(xhr.responseText);
              console.error('Upload error response:', response);
              errorMessage = response.message || errorMessage;
            } catch (e) {
              console.error('Failed to parse error response:', xhr.responseText);
            }
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = (event) => {
          clearTimeout(timeoutId);
          console.error('XHR Network error occurred:', event);
          console.error('XHR readyState:', xhr.readyState);
          console.error('XHR status:', xhr.status);
          console.error('XHR response:', xhr.responseText);
          reject(new Error('Network error'));
        };

        xhr.onabort = () => {
          clearTimeout(timeoutId);
          console.warn('Upload was aborted for file:', upload.file.name);
          reject(new Error('Upload cancelled'));
        };

        const uploadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/properties/upload`;
        console.log('Upload URL:', uploadUrl);

        xhr.open('POST', uploadUrl);

        // Add auth header if available
        const token = localStorage.getItem('auth_token');
        console.log('Token available:', !!token);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          console.log('Authorization header set');
        }

        console.log('Sending upload request...');
        xhr.send(formData);
      });

      await uploadPromise;

    } catch (error) {
      console.error('Upload failed for file:', upload.file.name);
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Property ID:', propertyId);

      upload.status = 'failed';
      upload.error = error instanceof Error ? error.message : 'Upload failed';

      // Log the failed upload item
      console.error('Failed upload item:', {
        id: upload.id,
        fileName: upload.file.name,
        fileSize: upload.file.size,
        status: upload.status,
        error: upload.error
      });
    } finally {
      this.activeUploads--;
      this.notifyProgressUpdate();

      console.log('Upload completed/failed, active uploads:', this.activeUploads);
      console.log('Continuing to process queue for property:', propertyId);

      // Continue processing queue
      this.processQueue(propertyId);
    }
  }

  private notifyProgressUpdate() {
    const uploads = this.getQueueStatus();
    this.progressCallbacks.forEach(callback => callback(uploads));
  }

  private notifyImageUploaded(propertyId: string, imageUrls: string[]) {
    this.imageUploadedCallbacks.forEach(callback => callback(propertyId, imageUrls));
  }
}

export const uploadQueueService = new UploadQueue();