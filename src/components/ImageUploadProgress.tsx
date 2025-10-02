import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, X, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface ImageUploadProgressProps {
  uploads: UploadItem[];
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onDismiss: () => void;
  isVisible: boolean;
}

const ImageUploadProgress: React.FC<ImageUploadProgressProps> = ({
  uploads,
  onRetry,
  onCancel,
  onDismiss,
  isVisible
}) => {
  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <Upload className="w-4 h-4 text-muted-foreground" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <X className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: UploadItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-muted-foreground';
      case 'uploading':
        return 'bg-primary';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-destructive';
    }
  };

  if (!isVisible || uploads.length === 0) return null;

  const completedCount = uploads.filter(u => u.status === 'completed').length;
  const totalCount = uploads.length;
  const overallProgress = (completedCount / totalCount) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
      >
        <Card className="p-4 shadow-lg border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">
              Uploading Images ({completedCount}/{totalCount})
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                {Math.round(overallProgress)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-destructive/10"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <Progress value={overallProgress} className="mb-3" />

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploads.map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
              >
                {getStatusIcon(upload.status)}

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {upload.file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {upload.status === 'uploading' && (
                    <div className="text-xs text-muted-foreground">
                      {upload.progress}%
                    </div>
                  )}

                  {upload.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRetry(upload.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Retry
                    </Button>
                  )}

                  {(upload.status === 'pending' || upload.status === 'failed') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCancel(upload.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {uploads.some(u => u.status === 'failed') && (
            <div className="mt-2 text-xs text-destructive">
              Some uploads failed. Click retry to try again.
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageUploadProgress;