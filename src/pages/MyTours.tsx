import React, { useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMyToursQuery } from '@/store/api-new';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MyTours = () => {
  const { data, isLoading, error } = useGetMyToursQuery();

  useEffect(() => {
    if (error) {
      toast.error('Failed to load tours');
    }
  }, [error]);

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
            My Scheduled Tours
          </CardTitle>
          <CardDescription>
            View and manage your upcoming property tours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No tours scheduled</p>
              <p className="text-sm text-muted-foreground">
                Browse properties and schedule tours to see them here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Contact</TableHead>
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
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {tour.agent?.name || 'Agent'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {tour.agent?.phone && (
                            <a
                              href={`tel:${tour.agent.phone}`}
                              className="flex items-center gap-1 text-sm hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {tour.agent.phone}
                            </a>
                          )}
                          {tour.agent?.email && (
                            <a
                              href={`mailto:${tour.agent.email}`}
                              className="flex items-center gap-1 text-sm hover:underline"
                            >
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="break-all">{tour.agent.email}</span>
                            </a>
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

export default MyTours;