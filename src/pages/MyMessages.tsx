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

interface Message {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    images: string[];
  };
  propertyTitle: string;
  senderId?: {
    _id: string;
    name: string;
    email: string;
  };
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

// Mock data - no API calls
const mockMessages: Message[] = [
  {
    _id: '1',
    propertyId: {
      _id: 'prop1',
      title: 'Luxury Apartment in Downtown',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400']
    },
    propertyTitle: 'Luxury Apartment in Downtown',
    senderName: 'John Smith',
    senderEmail: 'john.smith@example.com',
    senderPhone: '+91 9876543210',
    message: 'Hi, I am interested in this property. Could you please share more details about the pricing and availability?',
    isRead: false,
    isArchived: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    propertyId: {
      _id: 'prop2',
      title: 'Modern Villa with Pool',
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400']
    },
    propertyTitle: 'Modern Villa with Pool',
    senderName: 'Sarah Johnson',
    senderEmail: 'sarah.j@example.com',
    senderPhone: '+91 9123456789',
    message: 'Hello! I would like to schedule a viewing for this villa. When would be a good time?',
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '3',
    propertyId: {
      _id: 'prop3',
      title: 'Commercial Space for Rent',
      images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400']
    },
    propertyTitle: 'Commercial Space for Rent',
    senderName: 'Mike Wilson',
    senderEmail: 'mike.wilson@example.com',
    senderPhone: '+91 9988776655',
    message: 'I am looking for a commercial space for my business. Is this property still available?',
    isRead: true,
    isArchived: true,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const mockStats = {
  total: 3,
  unread: 1,
  read: 2,
  archived: 1
};

const MyMessages = () => {
  const [messages] = useState<Message[]>(mockMessages);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [stats] = useState(mockStats);

  const { toast } = useToast();

  const markAsRead = (messageId: string) => {
    // Simulate marking as read - no API call
    toast({
      title: 'Message marked as read',
      description: 'Message has been marked as read successfully'
    });
  };

  const toggleArchive = (messageId: string) => {
    // Simulate archiving - no API call
    toast({
      title: 'Message archived',
      description: 'Message has been archived successfully'
    });
  };

  const deleteMessage = (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    // Simulate deletion - no API call
    toast({
      title: 'Message deleted',
      description: 'Message has been deleted successfully'
    });
    setDetailsModalOpen(false);
  };

  const viewMessageDetails = (message: Message) => {
    setSelectedMessage(message);
    setDetailsModalOpen(true);

    if (!message.isRead) {
      markAsRead(message._id);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <p className="text-2xl font-bold">{stats.read}</p>
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