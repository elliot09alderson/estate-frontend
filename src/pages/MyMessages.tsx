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
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">My Messages</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.read}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.archived}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter messages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'You haven\'t received any messages yet.' : `No ${filter} messages.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    !message.isRead ? 'border-primary' : ''
                  }`}
                  onClick={() => viewMessageDetails(message)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {!message.isRead && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                          <h3 className="font-semibold text-base md:text-lg truncate">{message.senderName}</h3>
                          {message.isArchived && (
                            <Badge variant="outline" className="text-xs">
                              <Archive className="w-3 h-3 mr-1" />
                              Archived
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{message.senderEmail}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            {message.senderPhone}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{message.propertyTitle}</span>
                        </div>

                        <p className="text-muted-foreground line-clamp-2 text-sm">{message.message}</p>

                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{format(new Date(message.createdAt), 'PPP')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleArchive(message._id);
                          }}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message._id);
                          }}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Message Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription className="sr-only">
              Details of the selected message
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">From</label>
                  <p className="font-medium break-words">{selectedMessage.senderName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium break-all text-sm">{selectedMessage.senderEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{selectedMessage.senderPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="font-medium text-sm">
                    {format(new Date(selectedMessage.createdAt), 'PPPp')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Property</label>
                <p className="font-medium break-words">{selectedMessage.propertyTitle}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="bg-muted/50 p-4 rounded-lg mt-2">
                  <p className="whitespace-pre-wrap break-words">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.propertyTitle}`;
                  }}
                  className="w-full sm:w-auto"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reply via Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toggleArchive(selectedMessage._id);
                    setDetailsModalOpen(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {selectedMessage.isArchived ? 'Unarchive' : 'Archive'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMessage(selectedMessage._id)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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