import React, { useState } from 'react';
import { Calendar, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MobileSelect from './MobileSelect';
import MobileDatePicker from './MobileDatePicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useScheduleTourMutation } from '@/store/api-new';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays } from 'date-fns';

interface ScheduleTourModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  agentName: string;
}

const ScheduleTourModal: React.FC<ScheduleTourModalProps> = ({
  open,
  onClose,
  propertyId,
  propertyTitle,
  agentName,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scheduleTour, { isLoading }] = useScheduleTourMutation();

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    date: tomorrow,
    time: '10:00',
    notes: '',
    buyerPhone: user?.phone || '',
    buyerEmail: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please select both date and time for the tour.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast({
        title: "Error",
        description: "Please select a future date for the tour.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await scheduleTour({
        propertyId,
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        buyerPhone: formData.buyerPhone,
        buyerEmail: formData.buyerEmail,
      }).unwrap();

      toast({
        title: "Tour Scheduled",
        description: `Your tour has been scheduled for ${format(new Date(formData.date), 'MMM dd, yyyy')} at ${formData.time}. ${agentName} will contact you soon.`,
      });

      setFormData({
        date: tomorrow,
        time: '10:00',
        notes: '',
        buyerPhone: user?.phone || '',
        buyerEmail: user?.email || '',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to schedule tour. Please try again.",
        variant: "destructive",
      });
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const popularTimeSlots = [
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Schedule Property Tour</DialogTitle>
          <DialogDescription>
            Schedule a tour for: <span className="font-medium">{propertyTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Tour Date <span className="text-destructive">*</span>
              </Label>
              <MobileDatePicker
                value={formData.date}
                min={tomorrow}
                onChange={(value) => setFormData({ ...formData, date: value })}
                label="Tour Date"
              />
            </div>

            <div>
              <Label htmlFor="time" className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Tour Time <span className="text-destructive">*</span>
              </Label>

              {/* Quick time selection for mobile */}
              <div className="md:hidden mb-2">
                <div className="flex gap-2 flex-wrap">
                  {popularTimeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot.value })}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        formData.time === slot.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <MobileSelect
                options={timeSlots.map(slot => ({ value: slot, label: slot }))}
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}
                placeholder="Select time"
                label="Tour Time"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2">
              Contact Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Your contact number"
              value={formData.buyerPhone}
              onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2">
              Contact Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              value={formData.buyerEmail}
              onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes" className="mb-2">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or questions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-gradient-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Schedule Tour
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTourModal;