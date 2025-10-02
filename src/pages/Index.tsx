import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Home,
  Users,
  Shield,
  Star,
  ArrowRight,
  Building,
  TreePine,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import propertyRequirementService, {
  PropertyRequirement,
} from "@/services/propertyRequirementService";
import StarRating from "@/components/StarRating";
import MobileSelect from "@/components/MobileSelect";

// Mock featured properties
const featuredProperties = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    price: 250000,
    location: "Downtown, New York",
    bedrooms: 2,
    bathrooms: 2,
    area: 850,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"],
    isFeatured: true,
    averageRating: 4.5,
    totalRatings: 23,
  },
  {
    id: "2",
    title: "Luxury Villa with Pool",
    price: 750000,
    location: "Beverly Hills, CA",
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    ],
    isFeatured: true,
    averageRating: 4.8,
    totalRatings: 15,
  },
  {
    id: "3",
    title: "Commercial Plot",
    price: 500000,
    location: "Business District",
    area: 5000,
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"],
    isFeatured: true,
    averageRating: 4.2,
    totalRatings: 8,
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [formData, setFormData] = useState<Partial<PropertyRequirement>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (
    field: keyof PropertyRequirement,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to properties page with search query
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/properties");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name, email, and phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean the data - remove undefined values and irrelevant fields
      const cleanData: Partial<PropertyRequirement> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Add property type if selected
      if (propertyType) {
        cleanData.propertyType =
          propertyType as PropertyRequirement["propertyType"];
      }

      // Add other fields only if they have values
      if (formData.budgetRange) cleanData.budgetRange = formData.budgetRange;
      if (formData.preferredLocation)
        cleanData.preferredLocation = formData.preferredLocation;
      if (formData.minSize && formData.minSize > 0)
        cleanData.minSize = formData.minSize;
      if (formData.additionalRequirements)
        cleanData.additionalRequirements = formData.additionalRequirements;

      // Only add bedrooms/bathrooms for apartment and house types
      if (propertyType === "apartment" || propertyType === "house") {
        if (formData.bedrooms && formData.bedrooms > 0)
          cleanData.bedrooms = formData.bedrooms;
        if (formData.bathrooms && formData.bathrooms > 0)
          cleanData.bathrooms = formData.bathrooms;
      }

      await propertyRequirementService.createRequirement(
        cleanData as PropertyRequirement
      );

      toast({
        title: "Success!",
        description:
          "Your property requirement has been submitted. We will contact you soon.",
      });

      // Reset form
      setFormData({});
      setPropertyType("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="lg:container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Find Your <span className="text-gradient-primary">Dream</span>{" "}
              Property
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Discover the perfect home, investment opportunity, or commercial
              space with our comprehensive real estate platform.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <Card className="card-elevated p-6">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col md:flex-row gap-4"
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search by location, property type..."
                      className="pl-12 h-14 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="btn-gradient-primary h-14 px-8 text-lg"
                  >
                    Search Properties
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 px-5 justify-center"
            >
              <Button size="lg" className="btn-gradient-primary" asChild>
                <Link to="/properties">
                  Browse Properties
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Join as Agent</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for your real estate journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Advanced Search",
                description:
                  "Find properties with powerful filters and smart recommendations",
              },
              {
                icon: Shield,
                title: "Verified Listings",
                description:
                  "All properties are verified by our team for authenticity",
              },
              {
                icon: Users,
                title: "Expert Agents",
                description: "Connect with licensed professionals in your area",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="card-elevated p-8 text-center group hover:shadow-[var(--shadow-large)] transition-all duration-300">
                  <div className="w-16 h-16 btn-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-xl text-muted-foreground">
              Hand-picked properties for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="card-elevated overflow-hidden group cursor-pointer">
                  <Link to={`/properties/${property.id}`}>
                    <div className="relative">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="btn-gradient-accent">Featured</Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>

                      {/* Star Rating */}
                      <div className="mb-3">
                        <StarRating
                          rating={property.averageRating}
                          totalRatings={property.totalRatings}
                          size="sm"
                          showCount={true}
                        />
                      </div>

                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-primary">
                          ₹{property.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                          {property.area} sqft
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/properties">
                View All Properties
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Property Categories</h2>
            <p className="text-xl text-muted-foreground">
              Find the perfect property type for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Building, name: "Apartments", count: "125 listings" },
              { icon: Home, name: "Houses", count: "89 listings" },
              { icon: Building, name: "Commercial", count: "56 listings" },
              { icon: TreePine, name: "Land", count: "34 listings" },
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="card-elevated p-6 text-center group cursor-pointer hover:shadow-[var(--shadow-large)] transition-all duration-300">
                  <div className="w-12 h-12 btn-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Want Property Form Section */}
      <section className="py-20 px-4 overflow-visible">
        <div className="lg:container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto overflow-visible"
          >
            <Card className="card-elevated lg:p-8 p-4 overflow-visible">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4">
                  Looking for a Specific Property?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Tell us what you're looking for and we'll help you find it
                </p>
              </div>

              <form className="space-y-6 overflow-visible" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Property Type
                    </label>
                    <MobileSelect
                      options={[
                        { value: "", label: "Select Type" },
                        { value: "apartment", label: "Apartment" },
                        { value: "house", label: "House" },
                        { value: "commercial", label: "Commercial" },
                        { value: "land", label: "Land" }
                      ]}
                      value={propertyType}
                      onValueChange={(newType) => {
                        setPropertyType(newType);

                        // Clear bedroom/bathroom data when switching to land/commercial
                        if (newType === "land" || newType === "commercial") {
                          setFormData((prev) => ({
                            ...prev,
                            bedrooms: undefined,
                            bathrooms: undefined,
                          }));
                        }
                      }}
                      placeholder="Select Type"
                      label="Property Type"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Budget Range
                    </label>
                    <MobileSelect
                      options={[
                        { value: "", label: "Select Budget" },
                        { value: "0-10L", label: "₹0 - ₹10 Lakhs" },
                        { value: "10L-25L", label: "₹10 Lakhs - ₹25 Lakhs" },
                        { value: "25L-50L", label: "₹25 Lakhs - ₹50 Lakhs" },
                        { value: "50L-1Cr", label: "₹50 Lakhs - ₹1 Crore" },
                        { value: "1Cr-2Cr", label: "₹1 Crore - ₹2 Crores" },
                        { value: "2Cr+", label: "₹2 Crores+" }
                      ]}
                      value={formData.budgetRange || ""}
                      onValueChange={(value) => handleInputChange("budgetRange", value)}
                      placeholder="Select Budget"
                      label="Budget Range"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preferred Location
                    </label>
                    <Input
                      placeholder="City, neighborhood, or area"
                      className="h-12"
                      value={formData.preferredLocation || ""}
                      onChange={(e) =>
                        handleInputChange("preferredLocation", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size (sqft)
                    </label>
                    <Input
                      type="number"
                      placeholder="Minimum size"
                      className="h-12"
                      value={formData.minSize || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "minSize",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                {propertyType !== "land" && propertyType !== "commercial" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bedrooms
                      </label>
                      <MobileSelect
                        options={[
                          { value: "", label: "Any" },
                          { value: "1", label: "1+" },
                          { value: "2", label: "2+" },
                          { value: "3", label: "3+" },
                          { value: "4", label: "4+" },
                          { value: "5", label: "5+" }
                        ]}
                        value={formData.bedrooms?.toString() || ""}
                        onValueChange={(value) =>
                          handleInputChange(
                            "bedrooms",
                            parseInt(value) || 0
                          )
                        }
                        placeholder="Any"
                        label="Bedrooms"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bathrooms
                      </label>
                      <MobileSelect
                        options={[
                          { value: "", label: "Any" },
                          { value: "1", label: "1+" },
                          { value: "2", label: "2+" },
                          { value: "3", label: "3+" },
                          { value: "4", label: "4+" }
                        ]}
                        value={formData.bathrooms?.toString() || ""}
                        onValueChange={(value) =>
                          handleInputChange(
                            "bathrooms",
                            parseInt(value) || 0
                          )
                        }
                        placeholder="Any"
                        label="Bathrooms"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    className="w-full p-4 rounded-md border border-input bg-background min-h-[100px]"
                    placeholder="Tell us more about what you're looking for (e.g., parking, garden, near schools, etc.)"
                    value={formData.additionalRequirements || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "additionalRequirements",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      className="h-12"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="h-12"
                      value={formData.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="h-12"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="btn-gradient-primary px-8"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Property Request"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="card-elevated p-12 text-center bg-gradient-to-r from-primary/10 to-accent/10">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of satisfied customers who found their dream
                properties
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-gradient-primary" asChild>
                  <Link to="/register">
                    Get Started Today
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/properties">Browse Properties</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
