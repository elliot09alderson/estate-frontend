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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Property Requirements</h1>
          <p className="text-muted-foreground">Manage customer property requirements</p>
        </div>
        <Button onClick={fetchRequirements} disabled={loading}>
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
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Input
                placeholder="Search by name, email, location..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger>
                <SelectValue placeholder="Filter by property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
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
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{requirement.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {requirement.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {requirement.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(requirement.status || 'pending')}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequirement(requirement);
                        setNewStatus(requirement.status || 'pending');
                        setShowStatusDialog(true);
                      }}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {requirement.propertyType && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {requirement.propertyType.charAt(0).toUpperCase() + requirement.propertyType.slice(1)}
                      </span>
                    </div>
                  )}
                  {requirement.budgetRange && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{getBudgetDisplay(requirement.budgetRange)}</span>
                    </div>
                  )}
                  {requirement.preferredLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{requirement.preferredLocation}</span>
                    </div>
                  )}
                  {requirement.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(requirement.createdAt)}</span>
                    </div>
                  )}
                </div>

                {requirement.additionalRequirements && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Additional Requirements:</p>
                    <p className="text-sm bg-muted p-3 rounded">{requirement.additionalRequirements}</p>
                  </div>
                )}

                {requirement.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Admin Notes:</p>
                    <p className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">{requirement.notes}</p>
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
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
            disabled={pagination.page >= pagination.pages}
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