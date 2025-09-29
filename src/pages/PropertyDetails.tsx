import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FeedbackForm from '@/components/FeedbackForm';
import ContactModal from '@/components/ContactModal';
import { useGetPropertyByIdQuery } from '@/store/api-new';

const PropertyDetails = () => {
  const { id } = useParams();
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const { data: propertyData, isLoading, error } = useGetPropertyByIdQuery(id || '');

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
          <div className="relative">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
            <div className="absolute top-4 left-4">
              <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'}>
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
              <img
                key={index}
                src={image}
                alt={`Property ${index + 2}`}
                className="w-full h-[240px] lg:h-[240px] object-cover rounded-lg"
              />
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
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {property.address}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary">
                ₹{property.price.toLocaleString()}
              </div>
              <div className="flex items-center space-x-6 text-muted-foreground">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 mr-2" />
                    {property.bedrooms} Bedrooms
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 mr-2" />
                    {property.bathrooms} Bathrooms
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {property.area} sqft
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-success mr-2" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Property Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Property Type:</span>
                  <span className="ml-2 font-medium capitalize">{property.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 font-medium">{property.location}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Listing Type:</span>
                  <span className="ml-2 font-medium capitalize">{property.listingType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Area:</span>
                  <span className="ml-2 font-medium">{property.area} sqft</span>
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
              <Button variant="outline" className="w-full" onClick={() => setContactModalOpen(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Tour
              </Button>
            </div>
          </Card>

          <ContactModal
            open={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
            agentName={property.agentName}
            agentEmail={property.agentId?.email || property.agentPhone}
            propertyTitle={property.title}
          />

          {/* Mortgage Calculator */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mortgage Calculator</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Loan Amount</label>
                <input 
                  type="text" 
                  defaultValue={`$${property.price.toLocaleString()}`}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                <input 
                  type="text" 
                  defaultValue="6.5"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
                <input 
                  type="text" 
                  defaultValue="30"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <Button variant="outline" className="w-full mt-4">
                Calculate Payment
              </Button>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                <p className="text-lg font-bold">$1,687/month</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;