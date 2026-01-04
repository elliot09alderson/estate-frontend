import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Home,
  Eye,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import propertyRequirementService, {
  PropertyRequirement,
  PropertyRequirementFilters
} from '@/services/propertyRequirementService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const AdminPropertyRequirements = () => {
  const [requirements, setRequirements] = useState<PropertyRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyRequirementFilters>({
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [selectedRequirement, setSelectedRequirement] = useState<PropertyRequirement | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const { toast } = useToast();

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await propertyRequirementService.getAllRequirements(filters);
      setRequirements(response.data as PropertyRequirement[]);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch property requirements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [filters]);

  const handleStatusChange = async () => {
    if (!selectedRequirement || !newStatus) return;

    try {
      await propertyRequirementService.updateStatus(
        selectedRequirement._id!,
        newStatus,
        statusNotes
      );

      toast({
        title: 'Success',
        description: 'Status updated successfully'
      });

      setShowStatusDialog(false);
      setSelectedRequirement(null);
      setNewStatus('');
      setStatusNotes('');
      fetchRequirements();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleFilterChange = (key: keyof PropertyRequirementFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      contacted: { color: 'bg-blue-100 text-blue-800', icon: Phone },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: RefreshCw },
      fulfilled: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge className={`${config?.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBudgetDisplay = (budgetRange: string) => {
    const budgetMap: { [key: string]: string } = {
      '0-10L': '₹0 - ₹10 Lakhs',
      '10L-25L': '₹10 - ₹25 Lakhs',
      '25L-50L': '₹25 - ₹50 Lakhs',
      '50L-1Cr': '₹50 Lakhs - ₹1 Crore',
      '1Cr-2Cr': '₹1 - ₹2 Crores',
      '2Cr+': '₹2 Crores+'
    };
    return budgetMap[budgetRange] || budgetRange;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Property Requirements</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage customer property requirements</p>
        </div>
        <Button onClick={fetchRequirements} disabled={loading} className="self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 sm:p-6 bg-background/95 backdrop-blur-sm border shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Input
                placeholder="Search by name, email, location..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-background/80"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="bg-background/80">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.propertyType || 'all'}
              onValueChange={(value) => handleFilterChange('propertyType', value)}
            >
              <SelectTrigger className="bg-background/80">
                <SelectValue placeholder="Filter by property type" />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto bg-background/80">
              Clear Filters
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Requirements List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : requirements.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No requirements found</h3>
            <p className="text-muted-foreground">No property requirements match your filters.</p>
          </Card>
        ) : (
          requirements.map((requirement, index) => (
            <motion.div
              key={requirement._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate max-w-[200px] break-words">{requirement.name}</h3>
                      <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate break-all">{requirement.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{requirement.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:flex-shrink-0">
                    {getStatusBadge(requirement.status || 'pending')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequirement(requirement);
                        setNewStatus(requirement.status || 'pending');
                        setShowStatusDialog(true);
                      }}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      Update Status
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  {requirement.propertyType && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Home className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">
                        {requirement.propertyType.charAt(0).toUpperCase() + requirement.propertyType.slice(1)}
                      </span>
                    </div>
                  )}
                  {requirement.budgetRange && (
                    <div className="flex items-center gap-2 min-w-0">
                      <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{getBudgetDisplay(requirement.budgetRange)}</span>
                    </div>
                  )}
                  {requirement.preferredLocation && (
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate break-words">{requirement.preferredLocation}</span>
                    </div>
                  )}
                  {requirement.createdAt && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs sm:text-sm truncate">{formatDate(requirement.createdAt)}</span>
                    </div>
                  )}
                </div>

                {requirement.additionalRequirements && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Additional Requirements:</p>
                    <p className="text-sm bg-muted p-3 rounded break-words">{requirement.additionalRequirements}</p>
                  </div>
                )}

                {requirement.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Admin Notes:</p>
                    <p className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-400 break-words">{requirement.notes}</p>
                  </div>
                )}

                {requirement.assignedAgent && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Assigned to: {requirement.assignedAgent.name}</span>
                  </div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 px-4">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
            disabled={pagination.page <= 1}
            className="w-full sm:w-auto bg-background/80"
          >
            Previous
          </Button>
          <span className="flex items-center px-3 py-2 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
            disabled={pagination.page >= pagination.pages}
            className="w-full sm:w-auto bg-background/80"
          >
            Next
          </Button>
        </div>
      )}

      {/* Status Update Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status</AlertDialogTitle>
            <AlertDialogDescription>
              Update the status for {selectedRequirement?.name}'s property requirement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Add notes (optional)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowStatusDialog(false);
              setSelectedRequirement(null);
              setNewStatus('');
              setStatusNotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPropertyRequirements;