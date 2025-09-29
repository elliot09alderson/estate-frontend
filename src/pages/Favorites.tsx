import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Square, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useGetFavoritesQuery } from '@/hooks/useAdaptedApi';
import { useToggleFavoriteMutation } from '@/store/api-new';

const Favorites = () => {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useGetFavoritesQuery();
  const [toggleFavorite] = useToggleFavoriteMutation();

  const favoriteProperties = data?.favorites || [];

  const handleRemoveFavorite = async (propertyId: string, propertyTitle: string) => {
    try {
      await toggleFavorite(propertyId).unwrap();
      refetch();
      toast({
        title: "Removed from favorites",
        description: `${propertyTitle} has been removed from your favorites.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      for (const property of favoriteProperties) {
        await toggleFavorite(property._id).unwrap();
      }
      refetch();
      toast({
        title: "All favorites cleared",
        description: "Your favorites list has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear favorites.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Heart className="w-8 h-8 mr-3 text-red-500 fill-red-500" />
              My Favorites
            </h1>
            <p className="text-muted-foreground mt-2">
              Properties you've saved for later
            </p>
          </div>

          {favoriteProperties.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        {favoriteProperties.length === 0 ? (
          <Card className="card-elevated p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring properties and save your favorites here
            </p>
            <Button asChild className="btn-gradient-primary">
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{favoriteProperties.length}</div>
                <div className="text-sm text-muted-foreground">Saved Properties</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  ${(favoriteProperties.reduce((acc, prop) => acc + prop.price, 0) / favoriteProperties.length).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Average Price</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(favoriteProperties.reduce((acc, prop) => acc + prop.area, 0) / favoriteProperties.length)}
                </div>
                <div className="text-sm text-muted-foreground">Average Sqft</div>
              </Card>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-elevated overflow-hidden group">
                    <div className="relative">
                      <Link to={`/properties/${property._id}`}>
                        <img
                          src={property.images[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'}
                          alt={property.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/80 hover:bg-white text-red-500"
                        onClick={() => handleRemoveFavorite(property._id, property.title)}
                      >
                        <Heart className="w-4 h-4 fill-red-500" />
                      </Button>

                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
                          Added {new Date(property.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link to={`/properties/${property._id}`}>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </Link>

                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-primary">
                          ${property.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {property.bedrooms && (
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {property.bedrooms} bed
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {property.bathrooms} bath
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          {property.area} sqft
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Listed by {property.agentName}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFavorite(property._id, property.title)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-8 space-x-4">
              <Button variant="outline" size="lg" asChild>
                <Link to="/properties">Browse More Properties</Link>
              </Button>
              <Button size="lg" className="btn-gradient-primary">
                Contact Agents
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Favorites;