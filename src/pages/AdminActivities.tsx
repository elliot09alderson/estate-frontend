import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  UserX,
  UserCheck,
  Shield,
  MessageSquare,
  ArrowLeft,
  Filter,
  Clock,
  User,
  Home,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Edit3,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MobileSelect from '@/components/MobileSelect';
import { useGetActivitiesQuery } from '@/hooks/useAdaptedApi';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const actionIcons: Record<string, any> = {
  approved_property: CheckCircle,
  rejected_property: XCircle,
  deleted_property: Trash2,
  deactivated_agent: UserX,
  activated_agent: UserCheck,
  blocked_user: Shield,
  unblocked_user: Shield,
  deleted_user: Trash2,
  updated_property: Edit3,
  responded_feedback: MessageSquare,
};

const actionStyles: Record<string, { bg: string; text: string; border: string }> = {
  approved_property: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  rejected_property: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  deleted_property: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  deactivated_agent: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  activated_agent: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  blocked_user: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  unblocked_user: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20' },
  deleted_user: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  updated_property: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  responded_feedback: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
};

const targetTypeIcons: Record<string, any> = {
  property: Home,
  user: User,
  feedback: MessageSquare,
};

const AdminActivities = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');

  const { data: activitiesData, isLoading } = useGetActivitiesQuery({
    page,
    limit: 20,
    action: actionFilter || undefined,
  });

  const activities = activitiesData?.activities || [];
  const pagination = activitiesData?.pagination;

  const getActionDisplay = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Activity Log</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track all admin actions and changes</p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <MobileSelect
              value={actionFilter}
              onValueChange={(value) => {
                setActionFilter(value);
                setPage(1);
              }}
              placeholder="All Actions"
              options={[
                { value: "", label: "All Actions" },
                { value: "approved_property", label: "Approved Property" },
                { value: "rejected_property", label: "Rejected Property" },
                { value: "deleted_property", label: "Deleted Property" },
                { value: "deactivated_agent", label: "Deactivated Agent" },
                { value: "activated_agent", label: "Activated Agent" },
                { value: "blocked_user", label: "Blocked User" },
                { value: "unblocked_user", label: "Unblocked User" },
                { value: "deleted_user", label: "Deleted User" },
                { value: "responded_feedback", label: "Responded Feedback" }
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approvals</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.action.includes('approved')).length}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rejections</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.action.includes('rejected')).length}
                </p>
              </div>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Updates</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.action.includes('updated')).length}
                </p>
              </div>
              <Edit3 className="w-5 h-5 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
              <Activity className="w-5 h-5 text-primary" />
            </div>
          </Card>
        </div>

        {/* Activities List */}
        <Card className="card-elevated">
          <div className="p-4 sm:p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activities
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No activities found</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => {
                const Icon = actionIcons[activity.action] || Activity;
                const style = actionStyles[activity.action] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
                const TargetIcon = targetTypeIcons[activity.targetType] || AlertCircle;

                return (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 sm:p-6 hover:bg-secondary/30 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Icon and Timeline */}
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} border ${style.border}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p className="font-medium text-sm sm:text-base leading-relaxed">
                                {activity.description}
                              </p>

                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {/* Admin Avatar and Name */}
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs bg-primary/10">
                                      {activity.adminName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-muted-foreground font-medium">
                                    {activity.adminName}
                                  </span>
                                </div>

                                {/* Action Badge */}
                                <Badge variant="outline" className={`${style.text} ${style.border} text-xs px-2 py-0.5`}>
                                  {getActionDisplay(activity.action)}
                                </Badge>

                                {/* Target Type */}
                                {activity.targetType && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <TargetIcon className="w-3 h-3" />
                                    <span className="capitalize">{activity.targetType}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Timestamp */}
                            <div className="flex flex-col items-end gap-1 min-w-fit">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/30 rounded-lg border border-border/30">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                                  {formatDate(activity.createdAt)}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono bg-muted/20 px-2 py-0.5 rounded">
                                {formatTime(activity.createdAt)}
                              </div>
                            </div>
                          </div>

                          {/* Target Name */}
                          {activity.targetName && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                              <Eye className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium">Target: {activity.targetName}</span>
                            </div>
                          )}

                          {/* Metadata */}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Additional Details</p>
                              <pre className="text-xs overflow-auto text-foreground/80 font-mono">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && (pagination.hasNext || pagination.hasPrev) && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-t bg-secondary/20">
              <div className="text-sm text-muted-foreground">
                Showing page <span className="font-medium text-foreground">{pagination.currentPage}</span> of{' '}
                <span className="font-medium text-foreground">{pagination.totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4"
                >
                  Next
                  <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminActivities;