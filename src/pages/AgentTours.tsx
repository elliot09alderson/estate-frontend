import React, { useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAgentToursQuery, useUpdateTourStatusMutation } from '@/store/api-new';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AgentTours = () => {
  const { data, isLoading, error, refetch } = useGetAgentToursQuery();
  const [updateTourStatus] = useUpdateTourStatusMutation();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load tours');
    }
  }, [error]);

  const handleStatusUpdate = async (tourId: string, status: 'accepted' | 'cancelled' | 'completed') => {
    try {
      await updateTourStatus({ tourId, status }).unwrap();

      const statusMessage = status === 'accepted'
        ? 'Tour has been accepted'
        : status === 'completed'
        ? 'Tour has been marked as completed'
        : 'Tour has been cancelled';

      toast.success(statusMessage);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to update tour status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Rescheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tours = data?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tour Requests
          </CardTitle>
          <CardDescription>
            Manage tour requests from potential buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No tour requests</p>
              <p className="text-sm text-muted-foreground">
                You will see tour requests from buyers here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour: any) => (
                    <TableRow key={tour._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tour.property?.title || 'Property'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {tour.property?.address || tour.property?.location || 'Address not available'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {tour.buyer?.name || 'Buyer'}
                          </div>
                          {tour.buyerPhone && (
                            <a
                              href={`tel:${tour.buyerPhone}`}
                              className="flex items-center gap-1 text-sm hover:underline mt-1"
                            >
                              <Phone className="h-3 w-3" />
                              {tour.buyerPhone}
                            </a>
                          )}
                          {tour.buyerEmail && (
                            <a
                              href={`mailto:${tour.buyerEmail}`}
                              className="flex items-center gap-1 text-sm hover:underline"
                            >
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="break-all">{tour.buyerEmail}</span>
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(tour.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {tour.time}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tour.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">
                          {tour.notes || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {tour.status === 'scheduled' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleStatusUpdate(tour._id, 'accepted')}
                              >
                                <Check className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(tour._id, 'cancelled')}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {tour.status === 'accepted' && (
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                              onClick={() => handleStatusUpdate(tour._id, 'completed')}
                            >
                              <Check className="h-4 w-4" />
                              Mark Complete
                            </Button>
                          )}
                          {(tour.status === 'completed' || tour.status === 'cancelled') && (
                            <span className="text-sm text-muted-foreground">No actions</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentTours;