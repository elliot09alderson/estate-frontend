import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  Check,
  Loader2,
  Star,
  Building,
  Home,
  Store,
  TreePine,
  Tag,
  Ruler,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Key,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Shield,
  Zap,
  Wind,
  Flame,
  Camera,
  Users,
  Gamepad2,
  Coffee,
  Utensils,
  Droplets,
  Sprout,
  Navigation,
  Milestone,
  Tv,
  GraduationCap,
  PlusCircle,
  Warehouse,
  Wind as AirVent,
  Trash2,
  Construction,
  Fence,
  Layers,
  LocateFixed,
  LayoutDashboard,
  Compass,
  ShieldCheck,
  FileCheck,
  Truck,
  AlertTriangle,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ContactModal from '@/components/ContactModal';
import ScheduleTourModal from '@/components/ScheduleTourModal';
import StarRating from '@/components/StarRating';
import RatingModal from '@/components/RatingModal';
import ImageZoomModal from '@/components/ImageZoomModal';
import { useGetPropertyByIdQuery, useToggleFavoriteMutation } from '@/store/api-new';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { formatPriceWithWords } from '@/lib/priceFormatter';

// Amenity icon mapping
const getAmenityIcon = (feature: string) => {
  const featureLower = feature.toLowerCase();

  // Water & Plumbing
  if (featureLower.includes('water') || featureLower.includes('plumbing')) return Droplets;
  
  // Electricity & Power
  if (featureLower.includes('electricity') || featureLower.includes('power') || featureLower.includes('backup') || featureLower.includes('generator') || featureLower.includes('zap')) return Zap;
  
  // Roads & Access
  if (featureLower.includes('road') || featureLower.includes('access') || featureLower.includes('highway') || featureLower.includes('connectivity')) return Navigation;
  
  // Land & Agriculture
  if (featureLower.includes('agricultural') || featureLower.includes('farm') || featureLower.includes('sprout') || featureLower.includes('soil')) return Sprout;
  if (featureLower.includes('garden') || featureLower.includes('lawn') || featureLower.includes('park') || featureLower.includes('greenery')) return TreePine;
  
  // Connectivity & Entertainment
  if (featureLower.includes('wifi') || featureLower.includes('internet') || featureLower.includes('broadband')) return Wifi;
  if (featureLower.includes('tv') || featureLower.includes('cable') || featureLower.includes('satellite')) return Tv;
  
  // Security
  if (featureLower.includes('security') || featureLower.includes('guard') || featureLower.includes('shield')) return Shield;
  if (featureLower.includes('cctv') || featureLower.includes('camera') || featureLower.includes('surveillance')) return Camera;
  
  // Climate Control
  if (featureLower.includes('heating') || featureLower.includes('geyser') || featureLower.includes('furnace')) return Flame;
  if (featureLower.includes('ac') || featureLower.includes('air conditioning') || featureLower.includes('cooling')) return AirVent;
  
  // Facilities
  if (featureLower.includes('gym') || featureLower.includes('fitness') || featureLower.includes('workout')) return Dumbbell;
  if (featureLower.includes('pool') || featureLower.includes('swimming')) return Waves;
  if (featureLower.includes('parking') || featureLower.includes('garage') || featureLower.includes('basement')) return Car;
  if (featureLower.includes('maintenance') || featureLower.includes('trash') || featureLower.includes('waste')) return Trash2;
  if (featureLower.includes('lift') || featureLower.includes('elevator')) return Building;
  
  // Social & Family
  if (featureLower.includes('community') || featureLower.includes('clubhouse') || featureLower.includes('hall')) return Users;
  if (featureLower.includes('game') || featureLower.includes('play') || featureLower.includes('kids')) return Gamepad2;
  if (featureLower.includes('balcony') || featureLower.includes('terrace')) return Home;
  if (featureLower.includes('kitchen') || featureLower.includes('modular')) return Utensils;
  if (featureLower.includes('cafe') || featureLower.includes('coffee')) return Coffee;
  
  // Infrastructure
  if (featureLower.includes('school') || featureLower.includes('education')) return GraduationCap;
  if (featureLower.includes('hospital') || featureLower.includes('medical') || featureLower.includes('healthcare')) return PlusCircle;
  if (featureLower.includes('industrial') || featureLower.includes('warehouse') || featureLower.includes('storage')) return Warehouse;
  if (featureLower.includes('construction') || featureLower.includes('boundary') || featureLower.includes('fenced') || featureLower.includes('fence')) return Fence;
  if (featureLower.includes('road') || featureLower.includes('highway') || featureLower.includes('connectivity') || featureLower.includes('access')) return Route;

  // Zones & Plot Types
  if (featureLower.includes('commercial') || featureLower.includes('business') || featureLower.includes('office') || featureLower.includes('shop')) return Store;
  if (featureLower.includes('residential') || featureLower.includes('house') || featureLower.includes('flat') || featureLower.includes('villa')) return Home;
  if (featureLower.includes('corner plot') || featureLower.includes('corner')) return MapPin;
  if (featureLower.includes('prime location') || featureLower.includes('main road')) return MapPin;
  if (featureLower.includes('clear title') || featureLower.includes('paperwork') || featureLower.includes('verified')) return FileCheck;
  if (featureLower.includes('loading') || featureLower.includes('dock') || featureLower.includes('truck')) return Truck;
  if (featureLower.includes('fire safety') || featureLower.includes('alert') || featureLower.includes('emergency')) return AlertTriangle;
  if (featureLower.includes('washroom') || featureLower.includes('toilet') || featureLower.includes('bathroom')) return Bath;
  if (featureLower.includes('high ceiling') || featureLower.includes('frontage') || featureLower.includes('wide')) return TrendingUp;
  if (featureLower.includes('mezzanine') || featureLower.includes('floor')) return Layers;
  if (featureLower.includes('facing') || featureLower.includes('north') || featureLower.includes('south') || featureLower.includes('east') || featureLower.includes('west')) return Compass;
  if (featureLower.includes('vastu') || featureLower.includes('compliant')) return ShieldCheck;
  if (featureLower.includes('gated') || featureLower.includes('community')) return Shield;
  
  // Land & Agriculture
  if (featureLower.includes('agricultural') || featureLower.includes('farm') || featureLower.includes('sprout') || featureLower.includes('soil') || featureLower.includes('leaf')) return Sprout;
  if (featureLower.includes('garden') || featureLower.includes('lawn') || featureLower.includes('park') || featureLower.includes('greenery')) return TreePine;

  // Default icon
  return Check;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<any>(null);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);

  // Scroll to top when component mounts or property ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: propertyData, isLoading, error } = useGetPropertyByIdQuery(id || '');
  const [toggleFavorite] = useToggleFavoriteMutation();

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to add favorites');
      return;
    }

    try {
      const isFavorited = user?.favorites?.includes(id!);
      await toggleFavorite(id!).unwrap();

      toast.success(
        isFavorited ? 'Removed from favorites' : 'Added to favorites'
      );
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };


  // Check if user has already rated
  useEffect(() => {
    const checkUserRating = async () => {
      if (user && id) {
        try {
          const token = localStorage.getItem('auth_token');
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          const response = await axios.get(
            `${baseUrl}/ratings/property/${id}/user`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (response.data.success) {
            setUserRating(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching user rating:', error);
        }
      }
    };

    checkUserRating();
  }, [user, id]);

  const handleShare = async () => {
    const property = propertyData?.data;
    if (!property) return;

    const shareData = {
      title: property.title,
      text: `Check out this ${property.listingType === 'sale' ? 'property for sale' : 'rental property'}: ${property.title}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Property shared successfully!');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Property URL copied to clipboard!');
      }
    } catch (error: any) {
      // If sharing was cancelled or failed, try clipboard fallback
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Property URL copied to clipboard!');
        } catch (clipboardError) {
          toast.error('Failed to share property');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !propertyData?.data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  const property = propertyData.data;

  // Get agent's current phone number from profile if populated, otherwise use property's stored phone
  const agentPhone = typeof property.agentId === 'object' && property.agentId?.phone
    ? property.agentId.phone
    : property.agentPhone;

  const agentEmail = typeof property.agentId === 'object' && property.agentId?.email
    ? property.agentId.email
    : property.agentPhone;

  const AgentCard = ({ className = "" }: { className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
      
      <div className="flex items-center mb-4">
        <Avatar className="w-12 h-12 mr-3">
          <AvatarImage src={typeof property.agentId === 'object' ? property.agentId.avatar : undefined} alt={property.agentName} />
          <AvatarFallback>{property.agentName?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{property.agentName}</h4>
          <StarRating
              rating={(typeof property.agentId === 'object' ? property.agentId.averageRating : property.averageRating) || 0}
              totalRatings={(typeof property.agentId === 'object' ? property.agentId.totalRatings : property.totalRatings) || 0}
              size="sm"
              showCount={true}
              className="mt-1"
            />
          <p className="text-sm text-muted-foreground mt-1">
            Real Estate Agent
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
          <span className="text-sm">{agentPhone}</span>
        </div>
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
          <span className="text-sm">{agentEmail}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button className="btn-gradient-primary w-full" asChild>
          <a href={`tel:${agentPhone}`}>
            <Phone className="w-4 h-4 mr-2" />
            Call Agent
          </a>
        </Button>
        <Button 
          variant="outline" 
          className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
          onClick={() => setContactModalOpen(true)}
        >
          <Mail className="w-4 h-4 mr-2" />
          Send Message
        </Button>
        <Button
          variant="outline"
          className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          onClick={() => {
            if (user) {
              setScheduleTourModalOpen(true);
            } else {
              navigate('/login', { state: { from: `/properties/${id}` } });
            }
          }}
        >
        <Calendar className="w-4 h-4 mr-2" />
        Schedule Tour
        </Button>
        <Button
          variant="outline"
          className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          onClick={() => {
            if (user) {
              setRatingModalOpen(true);
            } else {
              navigate('/login', { state: { from: `/properties/${id}` } });
            }
          }}
        >
          <Star className="w-4 h-4 mr-2" />
          {userRating ? 'Update Rating' : 'Rate Agent'}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative group cursor-pointer">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-64 md:h-80 lg:h-[500px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              onClick={() => {
                setSelectedImageIndex(0);
                setImageZoomOpen(true);
              }}
            />
            {/* Zoom indicator */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-4 left-4">
              <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'} className="flex items-center gap-1">
                {property.listingType === 'sale' ? (
                  <ShoppingCart className="w-3 h-3" />
                ) : (
                  <Key className="w-3 h-3" />
                )}
                For {property.listingType}
              </Badge>
            </div>
            {property.isFeatured && (
              <div className="absolute top-4 right-4">
                <Badge className="btn-gradient-accent">Featured</Badge>
              </div>
            )}
          </div>
          {property.images.length > 1 && (
            <div className="grid grid-cols-2 gap-4">
              {property.images.slice(1, 5).map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => {
                    setSelectedImageIndex(index + 1);
                    setImageZoomOpen(true);
                  }}
                >
                  <img
                    src={image}
                    alt={`Property ${index + 2}`}
                    className="w-full h-32 md:h-40 lg:h-[240px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Zoom indicator */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {/* Show remaining images count on last image */}
                  {index === 3 && property.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        +{property.images.length - 5} more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{property.title}</h1>

                {/* Star Rating */}


                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{property.address}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={`transition-all duration-300 ${
                    user?.favorites?.includes(id!)
                      ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                      : 'hover:bg-red-50 hover:text-red-500 hover:border-red-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-all duration-300 ${
                    user?.favorites?.includes(id!)
                      ? 'fill-current scale-110'
                      : 'hover:scale-110'
                  }`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-2xl lg:text-3xl font-bold text-primary">
                  <IndianRupee className="w-6 h-6 lg:w-7 lg:h-7" />
                  {formatPriceWithWords(property.price).formatted.replace('₹', '')}
                </div>
                <span className="text-sm text-muted-foreground ml-9">
                  {formatPriceWithWords(property.price).words}
                </span>
              </div>

              {/* Property stats - responsive grid layout */}
              <div className="grid grid-cols-2 lg:flex lg:items-center lg:space-x-6 gap-3 lg:gap-0 text-muted-foreground">
                {property.bedrooms && (
                  <div className="flex items-center bg-secondary/30 rounded-lg p-2 lg:bg-transparent lg:p-0">
                    <Bed className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-primary" />
                    <span className="text-sm lg:text-base">
                      <span className="font-medium">{property.bedrooms}</span>
                      <span className="hidden sm:inline"> Bed</span>
                      <span className="sm:hidden">BR</span>
                    </span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center bg-secondary/30 rounded-lg p-2 lg:bg-transparent lg:p-0">
                    <Bath className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-primary" />
                    <span className="text-sm lg:text-base">
                      <span className="font-medium">{property.bathrooms}</span>
                      <span className="hidden sm:inline"> Bath</span>
                      <span className="sm:hidden">BA</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center bg-secondary/30 rounded-lg p-2 lg:bg-transparent lg:p-0 col-span-2 lg:col-span-1">
                  <Square className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-primary" />
                  <span className="text-sm lg:text-base">
                    <span className="font-medium">{property.area}</span> sqft
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </Card>

          {/* Agent Card (Mobile only) */}
          <div className="lg:hidden mb-6">
            <AgentCard />
          </div>

          {/* Features */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {property.features.map((feature, index) => {
                const IconComponent = getAmenityIcon(feature);
                return (
                  <div key={index} className="flex items-center bg-secondary/20 rounded-lg p-3 hover:bg-secondary/30 transition-colors">
                    <IconComponent className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Property Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                {property.category === 'flat' && <Building className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />}
                {property.category === 'house' && <Home className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />}
                {property.category === 'shop' && <Store className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />}
                {property.category === 'land' && <TreePine className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground text-sm block">Property Type</span>
                  <p className="font-medium capitalize text-foreground">{property.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground text-sm block">Location</span>
                  <p className="font-medium text-foreground break-words">{property.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground text-sm block">Listing Type</span>
                  <p className="font-medium capitalize text-foreground">{property.listingType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ruler className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground text-sm block">Area</span>
                  <p className="font-medium text-foreground">{property.area} sqft</p>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Sidebar (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <AgentCard className="mb-6 sticky top-24" />
        </div>

        <ContactModal
          open={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          agentName={property.agentName}
          agentEmail={agentEmail}
          propertyTitle={property.title}
          propertyId={property._id}
        />

        <ScheduleTourModal
          open={scheduleTourModalOpen}
          onClose={() => setScheduleTourModalOpen(false)}
          propertyId={property._id}
          propertyTitle={property.title}
          agentName={property.agentName}
        />



        {/* Image Zoom Modal */}
        <ImageZoomModal
          isOpen={imageZoomOpen}
          onClose={() => setImageZoomOpen(false)}
          images={property.images}
          initialIndex={selectedImageIndex}
          propertyTitle={property.title}
        />

        <RatingModal
          open={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          propertyId={id!}
          propertyTitle={property.title}
          existingRating={userRating?.rating}
          existingReview={userRating?.review}
          onRatingSubmitted={() => {
            // Refresh logic - ideally invalidate tags, but window reload is a simple fallback
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};

export default PropertyDetails;