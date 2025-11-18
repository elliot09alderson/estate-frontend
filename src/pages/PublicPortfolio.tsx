import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Share2, MapPin, Home, DollarSign, Maximize, Bed, Bath, Eye, ExternalLink, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useGetPropertiesByAgentQuery, useTrackPropertyViewMutation } from '@/store/api-new';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatPriceWithWords } from '@/lib/priceFormatter';

const PublicPortfolio = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const limit = 12;

  const [trackView] = useTrackPropertyViewMutation();

  const { data, isLoading, isError } = useGetPropertiesByAgentQuery(
    {
      agentId: agentId || '',
      page: currentPage,
      limit,
    },
    {
      skip: !agentId,
    }
  );

  const allProperties = data?.data?.properties || [];
  const agentInfo = allProperties.length > 0 ? allProperties[0].agentId : null;

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return allProperties.filter((property: any) => {
      // Only show active and approved properties to public
      if (!property.isActive || property.isApproved !== 'approved') {
        return false;
      }

      // Search filter
      const matchesSearch = !searchQuery ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || property.category === categoryFilter;

      // Listing type filter
      const matchesListingType = listingTypeFilter === 'all' || property.listingType === listingTypeFilter;

      return matchesSearch && matchesCategory && matchesListingType;
    });
  }, [allProperties, searchQuery, categoryFilter, listingTypeFilter]);

  const totalPages = data?.data?.totalPages || 1;

  const handleShare = async () => {
    const portfolioUrl = `${window.location.origin}/agent/${agentId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${agentInfo?.name}'s Portfolio - RealEstate`,
          text: `Check out ${agentInfo?.name}'s property listings!`,
          url: portfolioUrl,
        });
        toast.success('Portfolio shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(portfolioUrl);
          toast.success('Portfolio link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(portfolioUrl);
      toast.success('Portfolio link copied to clipboard!');
    }
  };

  const handlePropertyClick = async (propertyId: string) => {
    // Only track views for logged-in users
    if (user) {
      try {
        await trackView(propertyId);
      } catch (error) {
        // Silently fail - view tracking shouldn't block navigation
        console.error('Failed to track view:', error);
      }
    }
    navigate(`/properties/${propertyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (isError || !agentInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <Home className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Portfolio Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">This agent portfolio doesn't exist or has no properties.</p>
          <Button onClick={() => navigate('/')} variant="outline" className="rounded-full px-6">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-1">
                {agentInfo.name}'s Portfolio
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} available
              </p>
            </div>
            <Button
              onClick={handleShare}
              variant="outline"
              size="default"
              className="gap-2 rounded-full px-6"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        {allProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-5"
          >
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by title, location, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 rounded-full border-border/50 focus:border-primary transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-6 items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground min-w-[70px]">Category</span>
                <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                  <TabsList className="h-9 p-1 bg-muted/50">
                    <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                    <TabsTrigger value="flat" className="text-xs px-3">Flat</TabsTrigger>
                    <TabsTrigger value="house" className="text-xs px-3">House</TabsTrigger>
                    <TabsTrigger value="shop" className="text-xs px-3">Shop</TabsTrigger>
                    <TabsTrigger value="land" className="text-xs px-3">Land</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Listing Type Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground min-w-[70px]">Type</span>
                <Tabs value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                  <TabsList className="h-9 p-1 bg-muted/50">
                    <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                    <TabsTrigger value="sale" className="text-xs px-3">Sale</TabsTrigger>
                    <TabsTrigger value="rent" className="text-xs px-3">Rent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Results Count */}
              <div className="ml-auto">
                <p className="text-xs text-muted-foreground">
                  {filteredProperties.length} of {allProperties.filter((p: any) => p.isActive && p.isApproved === 'approved').length} {allProperties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Properties Available</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery || categoryFilter !== 'all' || listingTypeFilter !== 'all'
                  ? 'Try adjusting your search terms or filters.'
                  : 'This agent has no properties listed at the moment.'}
              </p>
              {(searchQuery || categoryFilter !== 'all' || listingTypeFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setListingTypeFilter('all');
                  }}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {filteredProperties.map((property: any, index: number) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div onClick={() => handlePropertyClick(property._id)} className="cursor-pointer">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 h-full">
                      <div className="relative h-56 overflow-hidden bg-muted">
                        <img
                          src={property.images[0] || '/placeholder-property.jpg'}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 capitalize text-xs font-medium px-2 py-0.5">
                            {property.listingType}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5">
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-medium">{property.views || 0}</span>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="mb-3">
                          <h3 className="font-semibold text-base mb-1.5 line-clamp-1 text-foreground">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-muted-foreground text-xs">
                            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                            <span className="line-clamp-1">{property.city}, {property.state}</span>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between mb-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-foreground">{formatPriceWithWords(property.price).formatted}</span>
                              {property.listingType === 'rent' && <span className="text-xs text-muted-foreground">/mo</span>}
                            </div>
                            <span className="text-xs text-muted-foreground">{formatPriceWithWords(property.price).words}</span>
                          </div>
                          <Badge variant="outline" className="capitalize text-xs border-border/50">
                            {property.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pb-4 border-b border-border/50">
                          <div className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5" />
                            <span>{property.area.toLocaleString()} sq ft</span>
                          </div>
                          {property.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5" />
                              <span>{property.bedrooms} bed</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5" />
                              <span>{property.bathrooms} bath</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-4 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">View details</span>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-full px-4 h-9 text-xs"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 p-0 rounded-full text-xs ${
                          currentPage === page ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-full px-4 h-9 text-xs"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicPortfolio;
