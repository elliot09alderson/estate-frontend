import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import StarRating from './StarRating';
import axios from 'axios';

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  existingRating?: number;
  existingReview?: string;
  onRatingSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  open,
  onClose,
  propertyId,
  propertyTitle,
  existingRating = 0,
  existingReview = '',
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(existingRating);
  const [review, setReview] = useState(existingReview);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setRating(existingRating);
      setReview(existingReview);
    }
  }, [open, existingRating, existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ratings`,
        {
          propertyId,
          rating,
          review: review.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: existingRating > 0
            ? 'Your rating has been updated'
            : 'Thank you for your rating!'
        });

        onRatingSubmitted?.();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit rating',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(existingRating);
    setReview(existingReview);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingRating > 0 ? 'Update Your Rating' : 'Rate This Property'}
          </DialogTitle>
          <DialogDescription>
            Share your experience with: {propertyTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="text-center">
            <label className="block text-sm font-medium mb-3">
              How would you rate this property?
            </label>
            <StarRating
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
              className="justify-center"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Share your thoughts (optional)
            </label>
            <Textarea
              placeholder="What did you like about this property? Any suggestions?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {review.length}/500
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {existingRating > 0 ? 'Update Rating' : 'Submit Rating'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;