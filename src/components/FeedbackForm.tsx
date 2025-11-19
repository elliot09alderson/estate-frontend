import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCreateFeedbackMutation } from '@/store/api-new';
import { toast as sonnerToast } from 'sonner';

interface FeedbackFormProps {
  propertyId?: string;
  onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ propertyId, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      sonnerToast.error('Please select a rating');
      return;
    }

    try {
      const feedbackData: any = {
        subject: 'Property Review',
        rating,
        propertyId: propertyId || undefined,
      };

      // Only include message if it's not empty
      if (message.trim()) {
        feedbackData.message = message.trim();
      } else {
        feedbackData.message = 'No review provided';
      }

      await createFeedback(feedbackData).unwrap();

      sonnerToast.success('Thank you for your review!');

      setMessage('');
      setRating(0);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      sonnerToast.error(error?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <Card className="card-elevated p-6">
      <h3 className="text-xl font-semibold mb-2">Rate This Property</h3>
      <p className="text-sm text-muted-foreground mb-6">Share your experience with this property</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-3">
            Your Rating <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-10 h-10 ${
                    (hoveredRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-sm font-medium text-foreground">
                {rating} out of 5 stars
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Review (Optional)</label>
          <Textarea
            placeholder="Share details about your experience with this property..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {message.length}/500 characters
          </p>
        </div>

        <Button
          type="submit"
          className="w-full btn-gradient-primary"
          disabled={isLoading || rating === 0}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Star className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default FeedbackForm;