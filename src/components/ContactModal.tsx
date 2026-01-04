import React, { useState, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  agentName: string;
  agentEmail: string;
  propertyTitle?: string;
  propertyId: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
  open,
  onClose,
  agentName,
  agentEmail,
  propertyTitle,
  propertyId,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');  // Changed from 'token' to 'auth_token'
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/messages/send`,
        {
          propertyId,
          senderName: name,
          senderEmail: email,
          senderPhone: phone,
          message
        },
        config
      );

      if (response.data.success) {
        toast({
          title: "Message Sent",
          description: `Your message has been sent to ${agentName}. They will contact you soon.`,
        });

        // Only clear phone and message, keep name and email
        setPhone('');
        setMessage('');
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Contact {agentName}</DialogTitle>
          <DialogDescription>
            {propertyTitle
              ? `Send a message regarding: ${propertyTitle}`
              : 'Send a message to the agent'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAuthenticated}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthenticated}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Message <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="I'm interested in this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;