import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ArrowLeft,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import MobileSelect from '@/components/MobileSelect';
import { useRespondToFeedbackMutation } from '@/store/api-new';
import { useGetAllFeedbacksQuery } from '@/hooks/useAdaptedApi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminFeedbacks = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [respondDialog, setRespondDialog] = useState<{ open: boolean; feedbackId: string | null; subject: string }>({
    open: false,
    feedbackId: null,
    subject: ''
  });
  const [response, setResponse] = useState('');

  const { toast } = useToast();

  const { data: feedbacksData, isLoading } = useGetAllFeedbacksQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });

  const [respondToFeedback] = useRespondToFeedbackMutation();

  const feedbacks = feedbacksData?.feedbacks || [];
  const pagination = feedbacksData?.pagination;

  const handleRespond = async () => {
    if (!respondDialog.feedbackId || !response.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response.",
        variant: "destructive",
      });
      return;
    }

    try {
      await respondToFeedback({
        id: respondDialog.feedbackId,
        adminResponse: response.trim(),
      }).unwrap();

      toast({
        title: "Response Sent",
        description: "Your response has been sent successfully.",
      });

      setRespondDialog({ open: false, feedbackId: null, subject: '' });
      setResponse('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'reviewed':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'reviewed':
        return 'secondary';
      case 'pending':
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Feedbacks</h1>
            <p className="text-muted-foreground">Manage user feedback and inquiries</p>
          </div>
        </div>

        <Card className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">All Feedbacks</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <MobileSelect
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                placeholder="All Status"
                options={[
                  { value: "", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "reviewed", label: "Reviewed" },
                  { value: "resolved", label: "Resolved" }
                ]}
                className="w-40"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading feedbacks...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No feedbacks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors relative"
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{feedback.subject}</h4>
                      <Badge variant={getStatusVariant(feedback.status)} className="flex items-center gap-1">
                        {getStatusIcon(feedback.status)}
                        {feedback.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{feedback.userName}</span>
                      <span>•</span>
                      <span>{feedback.userEmail}</span>
                      {feedback.rating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{feedback.rating}/5</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm mb-3">{feedback.message}</p>

                  {feedback.adminResponse && (
                    <div className="bg-primary/5 border-l-4 border-primary p-3 rounded mb-3">
                      <p className="text-xs font-semibold text-primary mb-1">Admin Response:</p>
                      <p className="text-sm">{feedback.adminResponse}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      {!feedback.adminResponse && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRespondDialog({
                            open: true,
                            feedbackId: feedback._id,
                            subject: feedback.subject
                          })}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && (pagination.hasNext || pagination.hasPrev) && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog open={respondDialog.open} onOpenChange={(open) => !open && setRespondDialog({ open: false, feedbackId: null, subject: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Responding to: <strong>{respondDialog.subject}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Type your response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRespondDialog({ open: false, feedbackId: null, subject: '' });
              setResponse('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleRespond}>
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedbacks;