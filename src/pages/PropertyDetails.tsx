import { useState } from 'react';
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
  Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FeedbackForm from '@/components/FeedbackForm';
import ContactModal from '@/components/ContactModal';
import ScheduleTourModal from '@/components/ScheduleTourModal';
import StarRating from '@/components/StarRating';
import RatingModal from '@/components/RatingModal';
import ImageZoomModal from '@/components/ImageZoomModal';
import { useGetPropertyByIdQuery, useToggleFavoriteMutation } from '@/store/api-new';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Amenity icon mapping
const getAmenityIcon = (feature: string) => {
  const featureLower = feature.toLowerCase();

  if (featureLower.includes('wifi') || featureLower.includes('internet')) return Wifi;
  if (featureLower.includes('parking') || featureLower.includes('garage')) return Car;
  if (featureLower.includes('gym') || featureLower.includes('fitness')) return Dumbbell;
  if (featureLower.includes('pool') || featureLower.includes('swimming')) return Waves;
  if (featureLower.includes('security') || featureLower.includes('guard')) return Shield;
  if (featureLower.includes('power') || featureLower.includes('backup') || featureLower.includes('generator')) return Zap;
  if (featureLower.includes('ac') || featureLower.includes('air condition')) return Wind;
  if (featureLower.includes('heating') || featureLower.includes('furnace')) return Flame;
  if (featureLower.includes('cctv') || featureLower.includes('camera')) return Camera;
  if (featureLower.includes('community') || featureLower.includes('clubhouse')) return Users;
  if (featureLower.includes('game') || featureLower.includes('play')) return Gamepad2;
  if (featureLower.includes('balcony') || featureLower.includes('terrace')) return Home;
  if (featureLower.includes('kitchen') || featureLower.includes('modular')) return Utensils;
  if (featureLower.includes('laundry') || featureLower.includes('washing')) return Droplets;
  if (featureLower.includes('cafe') || featureLower.includes('coffee')) return Coffee;

  // Default icon
  return Check;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<{rating: number, review: string} | null>(null);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !propertyData?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  const property = propertyData.data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="relative group cursor-pointer">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
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
                  className="w-full h-[240px] lg:h-[240px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>

                {/* Star Rating */}
                <div className="mb-3">
                  <StarRating
                    rating={property.averageRating || 0}
                    totalRatings={property.totalRatings || 0}
                    size="md"
                    showCount={true}
                  />
                </div>

                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {property.address}
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
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                <IndianRupee className="w-7 h-7" />
                {property.price.toLocaleString()}
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

          {/* Feedback Form */}
          <FeedbackForm propertyId={id} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Agent Card */}
          <Card className="p-6 mb-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
            
            <div className="flex items-center mb-4">
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={property.agentId?.avatar} alt={property.agentName} />
                <AvatarFallback>{property.agentName?.charAt(0) || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{property.agentName}</h4>
                <p className="text-sm text-muted-foreground">
                  Real Estate Agent
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-sm">{property.agentPhone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-sm">{property.agentId?.email || property.agentPhone}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="btn-gradient-primary w-full" asChild>
                <a href={`tel:${property.agentPhone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Agent
                </a>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setContactModalOpen(true)}>
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant="outline"
                className="w-full"
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
              {user && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setRatingModalOpen(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {userRating ? 'Update Rating' : 'Rate Property'}
                </Button>
              )}
            </div>
          </Card>

          <ContactModal
            open={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
            agentName={property.agentName}
            agentEmail={property.agentId?.email || property.agentPhone}
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

          <RatingModal
            open={ratingModalOpen}
            onClose={() => setRatingModalOpen(false)}
            propertyId={property._id}
            propertyTitle={property.title}
            existingRating={userRating?.rating || 0}
            existingReview={userRating?.review || ''}
            onRatingSubmitted={() => {
              // Refresh property data to get updated rating
              window.location.reload();
            }}
          />

          {/* Image Zoom Modal */}
          <ImageZoomModal
            isOpen={imageZoomOpen}
            onClose={() => setImageZoomOpen(false)}
            images={property.images}
            initialIndex={selectedImageIndex}
            propertyTitle={property.title}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;