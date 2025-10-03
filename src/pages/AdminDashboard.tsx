import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminCharts from '@/components/AdminCharts';
import {
  Users,
  Home,
  IndianRupee,
  TrendingUp,
  Eye,
  EyeOff,
  BarChart3,
  Activity as ActivityIcon,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  MessageSquare,
  Ban,
  FileText,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useGetAdminPropertiesQuery,
  useGetPendingPropertiesQuery,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useDeleteUserMutation,
  useDeletePropertyAdminMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeactivateAgentMutation,
  useActivateAgentMutation,
  useTogglePropertyStatusMutation,
} from '@/store/api-new';
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
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'pending'>('overview');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'user' | 'property' | null; id: string | null; name: string }>({
    open: false,
    type: null,
    id: null,
    name: ''
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null; title: string }>({
    open: false,
    id: null,
    title: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');

  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 50 });
  const { data: propertiesData } = useGetAdminPropertiesQuery({ page: 1, limit: 50 });
  const { data: pendingData } = useGetPendingPropertiesQuery();

  const [approveProperty] = useApprovePropertyMutation();
  const [rejectProperty] = useRejectPropertyMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [deleteProperty] = useDeletePropertyAdminMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const [deactivateAgent] = useDeactivateAgentMutation();
  const [activateAgent] = useActivateAgentMutation();
  const [togglePropertyStatus] = useTogglePropertyStatusMutation();

  const users = usersData?.data?.users || [];
  const properties = propertiesData?.data?.properties || [];
  const pendingProperties = pendingData?.data?.properties || [];

  const handleApproveProperty = async (propertyId: string, title: string) => {
    try {
      await approveProperty(propertyId).unwrap();
      toast({
        title: "Property Approved",
        description: `"${title}" has been approved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve property.",
        variant: "destructive",
      });
    }
  };

  const handleRejectProperty = async () => {
    if (!rejectDialog.id || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      await rejectProperty({ id: rejectDialog.id, reason: rejectionReason }).unwrap();
      toast({
        title: "Property Rejected",
        description: `"${rejectDialog.title}" has been rejected.`,
      });
      setRejectDialog({ open: false, id: null, title: '' });
      setRejectionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject property.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;

    try {
      if (deleteDialog.type === 'user') {
        await deleteUser(deleteDialog.id).unwrap();
        toast({
          title: "User Deleted",
          description: `User "${deleteDialog.name}" has been deleted.`,
        });
      } else {
        await deleteProperty(deleteDialog.id).unwrap();
        toast({
          title: "Property Deleted",
          description: `Property "${deleteDialog.name}" has been deleted.`,
        });
      }
      setDeleteDialog({ open: false, type: null, id: null, name: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${deleteDialog.type}.`,
        variant: "destructive",
      });
    }
  };

  const handleToggleUserBlock = async (userId: string, isBlocked: boolean, userName: string) => {
    try {
      if (isBlocked) {
        await unblockUser(userId).unwrap();
        toast({
          title: "User Unblocked",
          description: `${userName} has been unblocked.`,
        });
      } else {
        await blockUser(userId).unwrap();
        toast({
          title: "User Blocked",
          description: `${userName} has been blocked.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAgentStatus = async (agentId: string, isActive: boolean, agentName: string) => {
    try {
      if (isActive) {
        await deactivateAgent(agentId).unwrap();
        toast({
          title: "Agent Deactivated",
          description: `${agentName} has been deactivated.`,
        });
      } else {
        await activateAgent(agentId).unwrap();
        toast({
          title: "Agent Activated",
          description: `${agentName} has been activated.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent status.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePropertyActive = async (propertyId: string, title: string) => {
    try {
      await togglePropertyStatus(propertyId).unwrap();
      toast({
        title: "Property Updated",
        description: `"${title}" status has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm lg:text-base">Manage users, properties, and platform analytics</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <Link to="/admin/activities" className="w-full">
              <Button variant="outline" size="sm" className="text-xs lg:text-sm w-full">
                <ActivityIcon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span>Activities</span>
              </Button>
            </Link>
            <Link to="/admin/feedbacks" className="w-full">
              <Button variant="outline" size="sm" className="text-xs lg:text-sm w-full">
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span>Feedbacks</span>
              </Button>
            </Link>
            <Link to="/admin/property-requirements" className="w-full">
              <Button variant="outline" size="sm" className="text-xs lg:text-sm w-full">
                <FileText className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span>Property Requirements</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.data?.users?.total?.toLocaleString() || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">Agents: {stats?.data?.users?.agents || 0}</span>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.data?.properties?.total || 0}</p>
              </div>
              <Home className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-success mr-1" />
              <span className="text-success">Approved: {stats?.data?.properties?.approved || 0}</span>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedbacks</p>
                <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.data?.feedbacks?.total || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-warning">Pending: {stats?.data?.feedbacks?.pending || 0}</span>
            </div>
          </Card>

          <Card className="card-elevated p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('pending')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingProperties.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-warning">Requires attention</span>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 mb-6">
          <div className="grid grid-cols-2 gap-2 bg-secondary/30 backdrop-blur-sm p-2 rounded-xl w-full border border-border/20">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className={`w-full px-3 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-secondary/50'
              }`}
              size="sm"
            >
              <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Overview</span>
            </Button>
            <Button
              variant={activeTab === 'pending' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('pending')}
              className={`w-full px-3 lg:px-6 py-3 relative text-xs lg:text-sm font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-secondary/50'
              }`}
              size="sm"
            >
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Pending</span>
              {pendingProperties.length > 0 && (
                <Badge className="ml-1 lg:ml-2 bg-warning text-white text-xs animate-pulse">{pendingProperties.length}</Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'properties' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('properties')}
              className={`w-full px-3 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-all duration-200 ${
                activeTab === 'properties'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-secondary/50'
              }`}
              size="sm"
            >
              <Home className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Properties</span>
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className={`w-full px-3 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'hover:bg-secondary/50'
              }`}
              size="sm"
            >
              <Users className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span>Users</span>
            </Button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Pending Properties</p>
                      <p className="text-2xl font-bold">{stats?.data?.properties?.pending || 0}</p>
                    </div>
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Rejected Properties</p>
                      <p className="text-2xl font-bold">{stats?.data?.properties?.rejected || 0}</p>
                    </div>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active Agents</p>
                      <p className="text-2xl font-bold">{users.filter(u => u.role === 'agent' && u.isActive).length}</p>
                    </div>
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                </Card>
              </div>
            </Card>
            <AdminCharts data={{
              byCategory: [
                { _id: 'flat', count: stats?.data?.properties?.byCategory?.flat || 45 },
                { _id: 'house', count: stats?.data?.properties?.byCategory?.house || 30 },
                { _id: 'shop', count: stats?.data?.properties?.byCategory?.shop || 15 },
                { _id: 'land', count: stats?.data?.properties?.byCategory?.land || 10 }
              ],
              byType: [
                { _id: 'sale', count: stats?.data?.properties?.byType?.sale || 65 },
                { _id: 'rent', count: stats?.data?.properties?.byType?.rent || 35 }
              ],
              monthlyData: stats?.data?.monthlyData || [
                { month: 'Jan', users: stats?.data?.users?.monthlyGrowth?.[0] || 45, properties: stats?.data?.properties?.monthlyGrowth?.[0] || 30 },
                { month: 'Feb', users: stats?.data?.users?.monthlyGrowth?.[1] || 52, properties: stats?.data?.properties?.monthlyGrowth?.[1] || 38 },
                { month: 'Mar', users: stats?.data?.users?.monthlyGrowth?.[2] || 48, properties: stats?.data?.properties?.monthlyGrowth?.[2] || 42 },
                { month: 'Apr', users: stats?.data?.users?.monthlyGrowth?.[3] || 61, properties: stats?.data?.properties?.monthlyGrowth?.[3] || 50 },
                { month: 'May', users: stats?.data?.users?.monthlyGrowth?.[4] || 55, properties: stats?.data?.properties?.monthlyGrowth?.[4] || 48 },
                { month: 'Jun', users: stats?.data?.users?.monthlyGrowth?.[5] || 67, properties: stats?.data?.properties?.monthlyGrowth?.[5] || 55 }
              ]
            }} />
          </div>
        )}

        {activeTab === 'pending' && (
          <Card className="card-elevated">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Pending Property Approvals</h3>
              <p className="text-muted-foreground">Review and approve or reject property listings</p>
            </div>
            <div className="p-6">
              {pendingProperties.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProperties.map((property) => (
                    <div key={property._id} className="flex flex-col lg:flex-row lg:items-start lg:justify-between p-4 border border-border rounded-lg space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-4 flex-1">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-16 h-16 lg:w-24 lg:h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Home className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link to={`/properties/${property._id}`} className="hover:underline">
                            <h4 className="font-medium text-base lg:text-lg truncate">{property.title}</h4>
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {property.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 lg:gap-3 mt-2">
                            <Badge className="text-xs">{property.category}</Badge>
                            <Badge variant="secondary" className="text-xs">For {property.listingType}</Badge>
                            <span className="text-xs lg:text-sm text-muted-foreground truncate">
                              by {property.agentName || 'Unknown'}
                            </span>
                            <span className="text-xs lg:text-sm font-semibold text-primary">
                              ₹{property.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-2 lg:ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveProperty(property._id, property.title)}
                          className="text-success hover:bg-success hover:text-white border-success text-xs lg:text-sm"
                        >
                          <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                          <span className="sm:hidden">✓</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRejectDialog({ open: true, id: property._id, title: property.title })}
                          className="text-destructive hover:bg-destructive hover:text-white border-destructive text-xs lg:text-sm"
                        >
                          <XCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">✗</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card className="card-elevated">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">User Management</h3>
              <p className="text-muted-foreground">Manage user accounts and permissions</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <Card key={user._id} className="p-4 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary">
                    <div className="flex flex-col space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base">{user.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-2">
                        <Badge
                          variant={user.role === 'admin' ? 'destructive' : user.role === 'agent' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                        <Badge
                          variant={user.isActive ? 'outline' : 'destructive'}
                          className={user.isActive ? 'border-green-500 text-green-600' : ''}
                        >
                          {user.isActive ? '● Active' : '○ Inactive'}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        {user.role === 'agent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAgentStatus(user._id, user.isActive, user.name)}
                            className="flex-1 text-xs"
                          >
                            {user.isActive ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserBlock(user._id, !user.isActive, user.name)}
                          className={`flex-1 text-xs ${!user.isActive ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          {!user.isActive ? 'Unblock' : 'Block'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, type: 'user', id: user._id, name: user.name })}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'properties' && (
          <Card className="card-elevated">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Property Management</h3>
              <p className="text-muted-foreground">Review and manage property listings</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property._id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-border rounded-lg space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <Home className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/properties/${property._id}`} className="hover:underline">
                          <h4 className="font-medium text-sm lg:text-base truncate">{property.title}</h4>
                        </Link>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">
                          by {property.agentName || 'Unknown'} • ₹{property.price.toLocaleString()}
                        </p>
                        <div className="flex flex-wrap gap-1 lg:gap-2 mt-1">
                          <Badge
                            variant={
                              property.isApproved === 'approved' ? 'default' :
                              property.isApproved === 'pending' ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {property.isApproved || 'approved'}
                          </Badge>
                          <Badge variant={property.isActive ? 'default' : 'destructive'} className="text-xs">
                            {property.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-1 lg:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePropertyActive(property._id, property.title)}
                        className="text-xs lg:text-sm"
                      >
                        {property.isActive ? <EyeOff className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> : <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
                        <span className="hidden sm:inline">{property.isActive ? 'Deactivate' : 'Activate'}</span>
                        <span className="sm:hidden">{property.isActive ? 'Off' : 'On'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, type: 'property', id: property._id, name: property.title })}
                        className="text-destructive hover:text-destructive text-xs lg:text-sm"
                      >
                        <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteDialog.type === 'user' ? 'the user' : 'the property'} "<strong>{deleteDialog.name}</strong>".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, id: null, title: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to reject "<strong>{rejectDialog.title}</strong>". Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectProperty} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reject Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;