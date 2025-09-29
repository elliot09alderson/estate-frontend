import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateFeedbackMutation } from '@/store/api-new';
import { useToast } from '@/hooks/use-toast';

interface FeedbackFormProps {
  propertyId?: string;
  onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ propertyId, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { toast } = useToast();
  const [createFeedback, { isLoading }] = useCreateFeedbackMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFeedback({
        subject: subject.trim(),
        message: message.trim(),
        rating: rating > 0 ? rating : undefined,
        propertyId: propertyId || undefined,
      }).unwrap();

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      setSubject('');
      setMessage('');
      setRating(0);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="card-elevated p-6">
      <h3 className="text-lg font-semibold mb-4">Send Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Subject *</label>
          <Input
            placeholder="Brief description of your feedback"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message *</label>
          <Textarea
            placeholder="Tell us more about your experience or suggestion..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1000}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {message.length}/1000 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
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
                  className={`w-8 h-8 ${
                    (hoveredRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} out of 5
              </span>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default FeedbackForm;