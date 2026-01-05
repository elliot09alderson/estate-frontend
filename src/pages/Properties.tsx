import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Loader2,
  Building,
  Home,
  Store,
  TreePine,
  Tag,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Link, useSearchParams } from "react-router-dom";
import {
  useGetPropertiesQuery,
  useToggleFavoriteMutation,
} from "@/store/api-new";
// NOTE: react-window was removed to enable natural page scrolling.
// Virtualization created an internal scroll container which felt unnatural.
// For large datasets (1000+ items), consider re-enabling with window scroll mode.
import { useAuthState, useAppDispatch } from "@/hooks/useRTKQuery";
import { setUser } from "@/store/authSlice";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import StarRating from "@/components/StarRating";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocation } from "@/hooks/useLocation";
import LocationPrompt from "@/components/LocationPrompt";
import locationService, { LocationData } from "@/services/locationService";

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
  bhkType?: string;
  furnishing?: string;
}

const Properties = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || undefined;

  // Get cached location for default search term
  const getDefaultSearchTerm = () => {
    if (initialSearch) return initialSearch;

    try {
      // First check what's actually in localStorage
      const rawLocationData = localStorage.getItem('userLocation');
      console.log('Raw localStorage userLocation:', rawLocationData);

      const cachedLocation = locationService.getCachedLocation();
      console.log('Cached location from service:', cachedLocation);

      if (cachedLocation) {
        console.log('City:', cachedLocation.city);
        console.log('State:', cachedLocation.state);
        console.log('Pincode:', cachedLocation.pincode);

        const locationParts = [cachedLocation.city, cachedLocation.state].filter(Boolean);
        const searchTerm = locationParts.join(", ");
        console.log('Generated search term:', searchTerm);
        return searchTerm;
      } else {
        console.log('No cached location found');
      }
    } catch (error) {
      console.error('Error getting cached location:', error);
    }
    return "";
  };

  const defaultSearchTerm = getDefaultSearchTerm();
  console.log('Default search term:', defaultSearchTerm); // Debug log

  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000000]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 40,
    category: initialCategory,
    ...(defaultSearchTerm && { location: defaultSearchTerm }),
  });

  // Debounce only search values (price will be handled on commit)
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Location hook
  const {
    location: userLocation,
    showPrompt: showLocationPrompt,
    skipLocation,
  } = useLocation();

  // Grid columns are now handled by Tailwind CSS responsive classes
  // No need for manual window resize tracking

  // Debug location hook state
  console.log('useLocation state:', {
    userLocation,
    showLocationPrompt,
    locationPromptShown: localStorage.getItem('locationPromptShown'),
    userLocationInStorage: localStorage.getItem('userLocation')
  });


  const { isAuthenticated, user } = useAuthState();
  const dispatch = useAppDispatch();

  const {
    data: propertiesData,
    error,
    isLoading,
    isFetching,
  } = useGetPropertiesQuery(filters);

  const [toggleFavorite] = useToggleFavoriteMutation();

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  // Show toast notification when using cached location
  useEffect(() => {
    if (!initialSearch && defaultSearchTerm) {
      toast.success("Using your saved location for search", {
        description: `Searching properties in ${defaultSearchTerm}`,
        duration: 3000,
      });
    }
  }, []); // Run only once on mount

  // Handle URL search parameter changes
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const categoryQuery = searchParams.get("category");

    if (searchQuery !== searchTerm || categoryQuery !== filters.category) {
      if (searchQuery) setSearchTerm(searchQuery);
      
      setFilters((prev) => ({
        ...prev,
        ...(searchQuery && { location: searchQuery }),
        category: categoryQuery || undefined,
        page: 1,
      }));

      // Scroll to top with smooth animation
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams]);

  // Initialize location-based filtering when user location is detected
  useEffect(() => {
    if (userLocation && !initialSearch && !searchTerm) {
      // Use city and pincode to filter properties initially
      const locationQuery = [userLocation.city, userLocation.pincode]
        .filter(Boolean)
        .join(" ");

      if (locationQuery) {
        setSearchTerm(locationQuery);
        setFilters((prev) => ({
          ...prev,
          location: locationQuery,
          page: 1,
        }));
      }
    }
  }, [userLocation, initialSearch]);

  // Update all properties when new data arrives
  useEffect(() => {
    if (propertiesData?.data?.properties) {
      if (filters.page === 1) {
        setAllProperties(propertiesData.data.properties);
      } else {
        setAllProperties((prev) => [
          ...prev,
          ...propertiesData.data.properties,
        ]);
      }
    }
  }, [propertiesData, filters.page]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (
      inView &&
      !isFetching &&
      propertiesData?.data &&
      filters.page! < propertiesData.data.totalPages
    ) {
      setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [inView, isFetching, propertiesData, filters.page]);

  // Track when user is typing
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsFiltering(true);
    } else {
      setIsFiltering(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Update filters when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      setFilters((prev) => ({
        ...prev,
        location: debouncedSearchTerm,
        page: 1,
      }));
    } else if (debouncedSearchTerm === "") {
      setFilters((prev) => {
        const { location, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  }, [debouncedSearchTerm]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Update filters when price range is committed (on release)
  useEffect(() => {
    // Only update if initial values have been changed
    if (priceRange[0] !== 0 || priceRange[1] !== 10000000) {
      setFilters((prev) => ({
        ...prev,
        minPrice:
          priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice:
          priceRange[1] < 10000000
            ? priceRange[1]
            : undefined,
        page: 1,
      }));
    }
  }, [priceRange]);

  // Handle price change while dragging (visual only)
  const handlePriceRangeChange = (newRange: number[]) => {
    setTempPriceRange(newRange);
  };

  // Handle price commit when user releases slider
  const handlePriceRangeCommit = (newRange: number[]) => {
    setPriceRange(newRange);
    setTempPriceRange(newRange);
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

  const filterOptions = useMemo(
    () => ({
      propertyTypes: [
        { value: "flat", label: "Apartment", icon: Building },
        { value: "house", label: "House", icon: Home },
        { value: "shop", label: "Commercial", icon: Store },
        { value: "land", label: "Land", icon: TreePine },
      ],
      listingTypes: [
        { value: "sale", label: "Buy" },
        { value: "rent", label: "Rent" },
      ],
      bedroomOptions: [
        { value: 1, label: "1+" },
        { value: 2, label: "2+" },
        { value: 3, label: "3+" },
        { value: 4, label: "4+" },
        { value: 5, label: "5+" },
      ],
      bhkTypes: [
        { value: "1rk", label: "1 RK" },
        { value: "1bhk", label: "1 BHK" },
        { value: "2bhk", label: "2 BHK" },
        { value: "3bhk", label: "3 BHK" },
        { value: "4bhk", label: "4 BHK" },
        { value: "5bhk", label: "5+ BHK" },
      ],
      furnishingTypes: [
        { value: "furnished", label: "Furnished" },
        { value: "semifurnished", label: "Semi-Furnished" },
        { value: "unfurnished", label: "Unfurnished" },
      ],
      priceRanges: [
        { min: 0, max: 100000, label: "Under ₹1L" },
        { min: 100000, max: 500000, label: "₹1L - ₹5L" },
        { min: 500000, max: 1000000, label: "₹5L - ₹10L" },
        { min: 1000000, max: 5000000, label: "₹10L - ₹50L" },
        { min: 5000000, max: 10000000, label: "₹50L+" },
      ],
    }),
    []
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.listingType) count++;
    if (filters.bedrooms) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.sortBy) count++;
    if (filters.bhkType) count++;
    if (filters.furnishing) count++;
    return count;
  }, [filters]);

  const handleToggleFavorite = async (
    propertyId: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to add favorites");
      return;
    }

    try {
      const isFavorited = user?.favorites?.includes(propertyId);
      const response = await toggleFavorite(propertyId).unwrap();

      if (response.data) {
        dispatch(setUser(response.data));
      }

      toast.success(
        isFavorited ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  const handleLocationDetected = async (location: LocationData) => {
    // Use city and pincode to filter properties initially
    const locationQuery = [location.city, location.pincode]
      .filter(Boolean)
      .join(" ");

    if (locationQuery) {
      setSearchTerm(locationQuery);
      setFilters((prev) => ({
        ...prev,
        location: locationQuery,
        page: 1,
      }));
    }
  };

  const handleSkipLocation = () => {
    // Continue with default view (all properties)
    skipLocation();
  };

  // Property Card Component for reuse
  const PropertyCard = ({ property }: { property: any }) => (
    <Link to={`/properties/${property._id}`} className="block h-full">
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl rounded-[1.5rem] transition-all duration-500 ease-out hover:-translate-y-2 group bg-card dark:bg-card h-full flex flex-col isolate relative ring-1 ring-black/5 dark:ring-white/10">
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden flex-shrink-0 bg-muted dark:bg-muted/50">
          <img
            src={
              property.images?.[0] ||
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
            }
            alt={property.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";
            }}
          />
          <div className="absolute top-3 left-3">
            <Badge
              className={`text-[10px] font-bold px-2 py-1 ${
                property.listingType === "sale"
                  ? "bg-emerald-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {property.listingType === "sale"
                ? "FOR SALE"
                : "FOR RENT"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 rounded-full w-10 h-10 p-0 shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center ${
              user?.favorites?.includes(property._id)
                ? "bg-red-500/90 hover:bg-red-500 text-white"
                : "bg-white/90 hover:bg-white text-gray-600 hover:text-red-500"
            }`}
            onClick={(e) => handleToggleFavorite(property._id, e)}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                user?.favorites?.includes(property._id)
                  ? "fill-current scale-110"
                  : "hover:scale-110"
              }`}
            />
          </Button>
          {/* Category Badge on Image */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="outline"
              className="text-xs font-medium capitalize bg-background/95 border-border text-foreground"
            >
              {property.category}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Title & Location */}
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-1.5 text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>



            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>

          {/* Property Details - In Row */}
          <div className="flex items-center gap-4 mb-3 py-2 px-3 bg-muted/30 dark:bg-muted/20 rounded-lg">
            {property.bedrooms !== null &&
              property.bedrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {property.bedrooms}
                  </span>
                </div>
              )}
            {property.bathrooms !== null &&
              property.bathrooms !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {property.bathrooms}
                  </span>
                </div>
              )}
            {property.area && (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {property.area} sqft
                </span>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto pt-3 border-t border-border">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold text-foreground mb-0.5">
                  ₹{Math.floor(property.price).toLocaleString()}
                </div>
                {property.category === "land" && property.area && (
                  <div className="text-xs text-muted-foreground">
                    ₹
                    {Math.floor(
                      property.price / property.area
                    ).toLocaleString()}
                    /sqft
                  </div>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <StarRating
                  rating={property.averageRating || 0}
                  totalRatings={property.totalRatings || 0}
                  size="sm"
                  showCount={false}
                  showRating={false}
                />
                <div className="text-xs font-semibold text-foreground line-clamp-1">
                  {property.agentName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );

  // PropertyRow component was removed - using simple CSS grid instead
  // This provides natural page scrolling with intersection observer for infinite scroll

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-light text-foreground mb-4 tracking-tight">
          Find Your Dream Property
        </h1>
        <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
          Discover the perfect home or investment opportunity
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative max-w-2xl mx-auto">
          {isFiltering && searchTerm !== debouncedSearchTerm ? (
            <Loader2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 animate-spin" />
          ) : (
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          )}
          <motion.div
            animate={initialSearch ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Input
              placeholder="Search location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-14 text-base border border-border bg-muted/30 rounded-full focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex items-center gap-4 pb-4 flex-wrap">
          {filterOptions.propertyTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() =>
                handleFilterChange(
                  "category",
                  filters.category === value ? undefined : value
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                filters.category === value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}

          {filterOptions.listingTypes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                handleFilterChange(
                  "listingType",
                  filters.listingType === value ? undefined : value
                )
              }
              className={`px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                filters.listingType === value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              {label}
            </button>
          ))}

          {/* Show BHK options when Apartment or House is selected */}
          {(filters.category === "flat" || filters.category === "house") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="contents"
            >
              {filterOptions.bhkTypes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() =>
                    handleFilterChange(
                      "bhkType",
                      filters.bhkType === value ? undefined : value
                    )
                  }
                  className={`px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                    filters.bhkType === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}

          {/* Show Furnishing options when Apartment or House is selected */}
          {(filters.category === "flat" || filters.category === "house") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="contents"
            >
              {filterOptions.furnishingTypes.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() =>
                    handleFilterChange(
                      "furnishing",
                      filters.furnishing === value ? undefined : value
                    )
                  }
                  className={`px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
                    filters.furnishing === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </motion.div>
          )}

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${
              showMoreFilters
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-border hover:border-foreground"
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
                      value={tempPriceRange}
                      onValueChange={handlePriceRangeChange}
                      onValueCommit={handlePriceRangeCommit}
                      max={10000000}
                      min={0}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <span>{formatPrice(tempPriceRange[0])}</span>
                    <span className="text-xs">to</span>
                    <span>{formatPrice(tempPriceRange[1])}</span>
                  </div>
                  {isFiltering && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Applying filters...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ page: 1, limit: 12 });
                    setPriceRange([0, 10000000]);
                    setTempPriceRange([0, 10000000]);
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
            <span className="text-muted-foreground font-medium">
              Loading properties...
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              {allProperties.length > 0
                ? `${allProperties.length} properties found`
                : "No properties found"}
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

      {/* Property Grid - Simple CSS Grid with Infinite Scroll */}
      {/* Using Tailwind responsive classes for column layout */}
      {/* Intersection observer (loadMoreRef) triggers loading more items when user scrolls near bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 pb-12">
        {allProperties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>

      {/* Infinite Scroll Trigger - when this element comes into view, load more */}
      <div ref={loadMoreRef} className="h-10" />

      {/* Infinite Scroll Loader for visual feedback */}
      {allProperties.length > 0 && (
        <div className="text-center mt-8 py-4">
          {isFetching && filters.page! > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">
                Loading more properties...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Location Prompt */}
      <LocationPrompt
        showPrompt={showLocationPrompt}
        onLocationDetected={handleLocationDetected}
        onSkip={handleSkipLocation}
      />
    </div>
  );
};

export default Properties;
