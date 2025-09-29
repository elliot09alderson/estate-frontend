import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Bed, Bath, Square, Heart, Loader2, Building, Home, Store, TreePine, Tag, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Link } from 'react-router-dom';
import { useGetPropertiesQuery, useToggleFavoriteMutation } from '@/store/api-new';
import { useAuthState, useAppDispatch } from '@/hooks/useRTKQuery';
import { setUser } from '@/store/authSlice';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer';

interface PropertyFilters {
  page?: number;
  limit?: number;
  category?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: string;
}

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12,
  });

  const { isAuthenticated, user } = useAuthState();
  const dispatch = useAppDispatch();

  const {
    data: propertiesData,
    error,
    isLoading,
    isFetching
  } = useGetPropertiesQuery(filters);

  const [toggleFavorite] = useToggleFavoriteMutation();

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  // Update all properties when new data arrives
  useEffect(() => {
    if (propertiesData?.data?.properties) {
      if (filters.page === 1) {
        setAllProperties(propertiesData.data.properties);
      } else {
        setAllProperties(prev => [...prev, ...propertiesData.data.properties]);
      }
    }
  }, [propertiesData, filters.page]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !isFetching && propertiesData?.data && filters.page! < propertiesData.data.totalPages) {
      setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [inView, isFetching, propertiesData, filters.page]);

  // Update filters when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setFilters(prev => ({ ...prev, location: searchTerm, page: 1 }));
      } else {
        setFilters(prev => {
          const { location, ...rest } = prev;
          return { ...rest, page: 1 };
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePriceRangeChange = (newRange: number[]) => {
    setPriceRange(newRange);
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        minPrice: newRange[0] > 0 ? newRange[0] : undefined,
        maxPrice: newRange[1] < 10000000 ? newRange[1] : undefined,
        page: 1
      }));
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}K`;
    } else {
      return `₹${price}`;
    }
  };

  const filterOptions = useMemo(() => ({
    propertyTypes: [
      { value: 'flat', label: 'Apartment', icon: Building },
      { value: 'house', label: 'House', icon: Home },
      { value: 'shop', label: 'Commercial', icon: Store },
      { value: 'land', label: 'Land', icon: TreePine }
    ],
    listingTypes: [
      { value: 'sale', label: 'Buy' },
      { value: 'rent', label: 'Rent' }
    ],
    bedroomOptions: [
      { value: 1, label: '1+' },
      { value: 2, label: '2+' },
      { value: 3, label: '3+' },
      { value: 4, label: '4+' },
      { value: 5, label: '5+' }
    ],
    priceRanges: [
      { min: 0, max: 100000, label: 'Under ₹1L' },
      { min: 100000, max: 500000, label: '₹1L - ₹5L' },
      { min: 500000, max: 1000000, label: '₹5L - ₹10L' },
      { min: 1000000, max: 5000000, label: '₹10L - ₹50L' },
      { min: 5000000, max: 10000000, label: '₹50L+' }
    ]
  }), []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.listingType) count++;
    if (filters.bedrooms) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.sortBy) count++;
    return count;
  }, [filters]);

  const handleToggleFavorite = async (propertyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to add favorites');
      return;
    }

    try {
      const isFavorited = user?.favorites?.includes(propertyId);
      const response = await toggleFavorite(propertyId).unwrap();

      if (response.data) {
        dispatch(setUser(response.data));
      }

      toast.success(
        isFavorited
          ? 'Removed from favorites'
          : 'Added to favorites'
      );
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-light text-foreground mb-4 tracking-tight">
          Find Your Dream Property
        </h1>
        <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
          Discover the perfect home or investment opportunity
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-14 text-base border border-border bg-muted/30 rounded-full focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex items-center gap-4 pb-4 flex-wrap">
          {filterOptions.propertyTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleFilterChange('category', filters.category === value ? undefined : value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                filters.category === value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}

          {filterOptions.listingTypes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange('listingType', filters.listingType === value ? undefined : value)}
              className={`px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                filters.listingType === value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
              showMoreFilters
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:border-foreground'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showMoreFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-6 bg-background border border-border rounded-2xl shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Price Range</h3>
                <div className="space-y-4">
                  <div className="px-3 py-2">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={10000000}
                      min={0}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span className="text-xs">to</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ page: 1, limit: 12 });
                    setPriceRange([0, 10000000]);
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-8">
        {isLoading && filters.page === 1 ? (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Loading properties...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              {allProperties.length > 0
                ? `${allProperties.length} properties found`
                : 'No properties found'
              }
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">
            Failed to load properties. Please try again later.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && allProperties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No properties found matching your criteria.
          </div>
        </div>
      )}

      {/* Property Grid - OYO Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {allProperties.map((property, index) => (
          <motion.div
            key={property._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/properties/${property._id}`}>
              <Card className="overflow-hidden border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 group bg-white h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`text-[10px] font-bold px-2 py-1 ${
                        property.listingType === 'sale'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {property.listingType === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/95 hover:bg-white rounded-full w-8 h-8 shadow-sm"
                    onClick={(e) => handleToggleFavorite(property._id, e)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        user?.favorites?.includes(property._id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-700'
                      }`}
                    />
                  </Button>
                  {/* Category Badge on Image */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="text-xs font-medium capitalize bg-white/95 border-gray-300 text-gray-900">
                      {property.category}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col">
                  {/* Title & Location */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg mb-1.5 text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>

                  {/* Property Details - In Row */}
                  <div className="flex items-center gap-4 mb-3 py-2 px-3 bg-gray-50 rounded-lg">
                    {property.bedrooms !== null && property.bedrooms !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms !== null && property.bathrooms !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{property.bathrooms}</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-1.5">
                        <Square className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{property.area} sqft</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section */}
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xl font-bold text-gray-900 mb-0.5">
                          ₹{Math.floor(property.price).toLocaleString()}
                        </div>
                        {property.category === 'land' && property.area && (
                          <div className="text-xs text-gray-500">
                            ₹{Math.floor(property.price / property.area).toLocaleString()}/sqft
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-500 mb-0.5">Listed by</div>
                        <div className="text-xs font-semibold text-gray-900 line-clamp-1">{property.agentName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      {allProperties.length > 0 && (
        <div ref={loadMoreRef} className="text-center mt-12 py-8">
          {isFetching && filters.page! > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading more properties...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Properties;