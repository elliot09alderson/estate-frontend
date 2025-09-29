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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetActivitiesQuery } from '@/hooks/useAdaptedApi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const actionIcons: Record<string, any> = {
  approved_property: CheckCircle,
  rejected_property: XCircle,
  deleted_property: Trash2,
  deactivated_agent: UserX,
  activated_agent: UserCheck,
  blocked_user: Shield,
  unblocked_user: Shield,
  deleted_user: Trash2,
  updated_property: Activity,
  responded_feedback: MessageSquare,
};

const actionColors: Record<string, string> = {
  approved_property: 'text-success',
  rejected_property: 'text-destructive',
  deleted_property: 'text-destructive',
  deactivated_agent: 'text-warning',
  activated_agent: 'text-success',
  blocked_user: 'text-destructive',
  unblocked_user: 'text-success',
  deleted_user: 'text-destructive',
  updated_property: 'text-primary',
  responded_feedback: 'text-primary',
};

const AdminActivities = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');

  const { data: activitiesData, isLoading } = useGetActivitiesQuery({
    page,
    limit: 50,
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
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
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
            <h1 className="text-3xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground">Track all admin actions and changes</p>
          </div>
        </div>

        <Card className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                className="p-2 border rounded-lg text-sm"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Actions</option>
                <option value="approved_property">Approved Property</option>
                <option value="rejected_property">Rejected Property</option>
                <option value="deleted_property">Deleted Property</option>
                <option value="deactivated_agent">Deactivated Agent</option>
                <option value="activated_agent">Activated Agent</option>
                <option value="blocked_user">Blocked User</option>
                <option value="unblocked_user">Unblocked User</option>
                <option value="deleted_user">Deleted User</option>
                <option value="responded_feedback">Responded Feedback</option>
              </select>
            </div>
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
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = actionIcons[activity.action] || Activity;
                const colorClass = actionColors[activity.action] || 'text-muted-foreground';

                return (
                  <div
                    key={activity._id}
                    className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-secondary ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getActionDisplay(activity.action)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              by {activity.adminName}
                            </span>
                            {activity.targetName && (
                              <span className="text-xs text-muted-foreground">
                                • Target: {activity.targetName}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-2 bg-secondary/30 rounded text-xs">
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
};

export default AdminActivities;