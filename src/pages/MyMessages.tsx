import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Search,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  User,
  Building,
  Clock,
  Dot,
  MoreVertical,
  Reply
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  useGetMyMessagesQuery,
  useGetMessageStatsQuery,
  useMarkMessageAsReadMutation,
  useToggleMessageArchiveMutation,
  useDeleteMessageMutation,
  Message as MessageType
} from '@/store/api-new';
import { toast as sonnerToast } from 'sonner';

const MyMessages = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { toast } = useToast();

  // Fetch messages and stats from API
  const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useGetMyMessagesQuery();
  const { data: statsData, isLoading: statsLoading } = useGetMessageStatsQuery();

  // Mutations
  const [markAsReadMutation] = useMarkMessageAsReadMutation();
  const [toggleArchiveMutation] = useToggleMessageArchiveMutation();
  const [deleteMessageMutation] = useDeleteMessageMutation();

  // Extract messages array from nested data structure
  const messages = messagesData?.data?.messages || [];
  const stats = statsData?.data || { total: 0, unread: 0, archived: 0 };

  const markAsRead = async (messageId: string) => {
    try {
      await markAsReadMutation(messageId).unwrap();
      sonnerToast.success('Message marked as read');
    } catch (error) {
      sonnerToast.error('Failed to mark message as read');
    }
  };

  const toggleArchive = async (messageId: string) => {
    try {
      await toggleArchiveMutation(messageId).unwrap();
      sonnerToast.success('Message archived');
    } catch (error) {
      sonnerToast.error('Failed to archive message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await deleteMessageMutation(messageId).unwrap();
      sonnerToast.success('Message deleted successfully');
      setDetailsModalOpen(false);
    } catch (error) {
      sonnerToast.error('Failed to delete message');
    }
  };

  const viewMessageDetails = (message: MessageType) => {
    setSelectedMessage(message);
    setDetailsModalOpen(true);

    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  // Filter messages based on filter and search term
  const filteredMessages = messages.filter(msg => {
    // Apply filter
    if (filter === 'unread' && msg.isRead) return false;
    if (filter === 'read' && !msg.isRead) return false;
    if (filter === 'archived' && !msg.isArchived) return false;

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        msg.senderName.toLowerCase().includes(searchLower) ||
        msg.senderEmail.toLowerCase().includes(searchLower) ||
        msg.propertyTitle.toLowerCase().includes(searchLower) ||
        msg.message.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM dd');
    }
  };

  // Loading state
  if (messagesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (messagesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Messages</h3>
          <p className="text-sm text-muted-foreground mb-4">Something went wrong. Please try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-6">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Calculate read count
  const readCount = messages.filter(msg => msg.isRead && !msg.isArchived).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your property inquiries</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {stats.unread} unread
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
              <Mail className="w-5 h-5 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Read</p>
                <p className="text-2xl font-bold">{readCount}</p>
              </div>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">{stats.archived}</p>
              </div>
              <Archive className="w-5 h-5 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search messages, contacts, or properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border bg-background"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[140px] border bg-background">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted/30 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No messages found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {filter === 'all' ? 'You haven\'t received any messages yet.' : `No ${filter} messages.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div
                  className={`group relative bg-background border rounded-xl p-4 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer ${
                    !message.isRead
                      ? 'border-primary/50 bg-primary/[0.02]'
                      : 'border-border/50 hover:border-border'
                  }`}
                  onClick={() => viewMessageDetails(message)}
                >
                  {/* Unread Indicator */}
                  {!message.isRead && (
                    <div className="absolute top-4 left-0 w-1 h-8 bg-primary rounded-r-full" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium text-sm">
                        {message.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {message.senderName}
                            </h3>
                            {!message.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="w-3 h-3" />
                            <span className="truncate">{message.propertyTitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(message.createdAt)}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(message._id);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                toggleArchive(message._id);
                              }}>
                                <Archive className="w-4 h-4 mr-2" />
                                {message.isArchived ? 'Unarchive' : 'Archive'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMessage(message._id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {message.message}
                      </p>

                      {/* Contact Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{message.senderEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{message.senderPhone}</span>
                        </div>
                        {message.isArchived && (
                          <Badge variant="outline" className="text-xs">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Message Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Message Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Details of the selected message
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              {/* Sender Info */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                    {selectedMessage.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedMessage.senderName}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{selectedMessage.senderEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedMessage.senderPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(selectedMessage.createdAt), 'PPPp')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Property Inquiry</span>
                </div>
                <p className="font-medium">{selectedMessage.propertyTitle}</p>
              </div>

              {/* Message */}
              <div>
                <h4 className="font-medium mb-3">Message</h4>
                <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-l-primary/50">
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.propertyTitle}`;
                  }}
                  className="flex-1"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `tel:${selectedMessage.senderPhone}`;
                  }}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toggleArchive(selectedMessage._id);
                    setDetailsModalOpen(false);
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {selectedMessage.isArchived ? 'Unarchive' : 'Archive'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyMessages;