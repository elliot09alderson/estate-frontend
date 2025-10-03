import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { State, City } from "country-state-city";
import {
  Building,
  TreePine,
  Home,
  Car,
  Shield,
  Camera,
  Snowflake,
  DoorOpen,
  Wind,
  Dumbbell,
  Waves,
  Zap,
  Phone,
  Users,
  Baby,
  HomeIcon,
  MapPin,
  Fence,
  Flame,
  Bed,
  ChefHat,
  Droplet,
  Sun,
  Box,
  Truck,
  Warehouse,
  AlertTriangle,
  Upload,
  FileCheck,
  Route,
  Droplets,
  Leaf,
  Store,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MobileSelect from "@/components/MobileSelect";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useCreatePropertyMutation } from "@/store/api-new";

const propertySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  price: z.number().min(1, "Price must be greater than 0"),
  category: z.enum(["flat", "land", "shop", "house"]),
  listingType: z.enum(["sale", "rent"]),
  area: z.number().min(1, "Area must be at least 1"),
  bedrooms: z.number().min(0).optional().nullable(),
  bathrooms: z.number().min(0).optional().nullable(),
  location: z.string().min(1, "Location is required").max(100).optional(),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().optional(),
  yearBuilt: z.number().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyCategories = [
  {
    id: "flat",
    name: "Flat/Apartment",
    description: "Residential apartments and flats",
    icon: Building,
  },
  {
    id: "land",
    name: "Land",
    description: "Agricultural and farming land",
    icon: TreePine,
  },
  {
    id: "shop",
    name: "Shop",
    description: "Commercial shops and retail spaces",
    icon: Building,
  },
  {
    id: "house",
    name: "House",
    description: "Residential houses and villas",
    icon: Home,
  },
];

const AddProperty = () => {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const indianStates = State.getStatesOfCountry("IN");
  const cities = selectedState
    ? City.getCitiesOfState("IN", selectedState)
    : [];

  const [createProperty, { isLoading: isCreating }] =
    useCreatePropertyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      category: (category as any) || "flat",
      listingType: "sale",
      features: [],
    },
  });

  useEffect(() => {
    if (category && propertyCategories.find((cat) => cat.id === category)) {
      setSelectedCategory(category);
      setSelectedFeatures([]);
      setValue("category", category as any);
    }
  }, [category, setValue]);

  // Auto-detect user location when component mounts
  useEffect(() => {
    const detectLocation = async () => {
      if (navigator.geolocation && !selectedState) {
        setLocationDetecting(true);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              // Use reverse geocoding to get location details
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
              );
              const data = await response.json();

              if (data && data.address) {
                const { state, city, town, village, postcode } = data.address;
                const detectedState = state || '';
                const detectedCity = city || town || village || '';
                const detectedPincode = postcode || '';

                // Find matching Indian state
                const matchedState = indianStates.find(s =>
                  s.name.toLowerCase().includes(detectedState.toLowerCase()) ||
                  detectedState.toLowerCase().includes(s.name.toLowerCase())
                );

                if (matchedState) {
                  setSelectedState(matchedState.isoCode);
                  setValue("state", matchedState.name);

                  // Set city if found
                  if (detectedCity) {
                    const stateCities = City.getCitiesOfState("IN", matchedState.isoCode);
                    const matchedCity = stateCities.find(c =>
                      c.name.toLowerCase() === detectedCity.toLowerCase()
                    );

                    if (matchedCity) {
                      setSelectedCity(matchedCity.name);
                      setValue("city", matchedCity.name);
                    } else {
                      // Use detected city even if not in list
                      setSelectedCity(detectedCity);
                      setValue("city", detectedCity);
                    }
                  }
                }

                // Set pincode
                if (detectedPincode) {
                  setValue("zipCode", detectedPincode);
                }

                // Set a partial address
                const addressParts = [];
                if (data.address.house_number) addressParts.push(data.address.house_number);
                if (data.address.road) addressParts.push(data.address.road);
                if (data.address.neighbourhood) addressParts.push(data.address.neighbourhood);
                if (addressParts.length > 0) {
                  setValue("address", addressParts.join(", "));
                }

                toast.success("Location auto-detected! You can modify if needed.", {
                  duration: 3000
                });
              }
            } catch (error) {
              console.error("Geocoding error:", error);
            } finally {
              setLocationDetecting(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocationDetecting(false);
            // Silent fail - user can fill manually
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    };

    detectLocation();
  }, [setValue]);

  // Session storage for image persistence
  useEffect(() => {
    // Save selected images to session storage
    if (selectedImages.length > 0) {
      const imageData = selectedImages.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
      sessionStorage.setItem('selectedImages', JSON.stringify(imageData));
    }
  }, [selectedImages]);


  const handleCategorySelect = (categoryId: string) => {
    navigate(`/add-property/${categoryId}`);
  };

  const handleBackToCategories = () => {
    navigate("/add-property");
    setSelectedCategory(null);
    setSelectedFeatures([]);
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) => {
      const updated = prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature];
      setValue("features", updated);
      return updated;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Validate file types - only allow jpeg, jpg, png, gif, webp
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      const validFiles = filesArray.filter(file => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const hasMimeType = file.type && allowedTypes.includes(file.type);
        const hasValidExtension = fileExtension && allowedExtensions.includes(fileExtension);

        // Accept file if either MIME type is valid OR extension is valid
        const isValid = hasMimeType || hasValidExtension;

        if (!isValid) {
          toast.error(`File "${file.name}" is not supported. Only JPEG, JPG, PNG, GIF, and WEBP images are allowed.`);
          console.log('Rejected file:', {
            name: file.name,
            type: file.type,
            extension: fileExtension,
            allowedTypes,
            allowedExtensions
          });
        } else if (!hasMimeType && hasValidExtension) {
          console.log('File accepted by extension despite missing/invalid MIME type:', file.name);
        }

        return isValid;
      });

      if (validFiles.length > 0) {
        setSelectedImages((prev) => [...prev, ...validFiles]);
        console.log('Added valid files:', validFiles.map(f => ({ name: f.name, type: f.type })));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };


  const onSubmit = async (data: PropertyFormData) => {
    if (selectedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setIsUploading(true);
      toast.success("Uploading images...");

      // Step 1: Upload all images first and collect URLs
      const uploadPromises = selectedImages.map(async (file) => {
        const formData = new FormData();
        formData.append('images', file);

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/properties/upload`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
          }

          const result = await response.json();
          console.log('Upload result:', result);

          if (result.success && result.data && result.data.images) {
            return result.data.images[0]; // Return the first uploaded image URL
          }
          throw new Error('Invalid upload response');
        } catch (error) {
          console.error('Image upload failed:', error);
          throw error;
        }
      });

      // Wait for all uploads to complete
      const uploadedImageUrls = await Promise.all(uploadPromises);
      console.log('All images uploaded:', uploadedImageUrls);

      // Step 2: Create property with real image URLs
      const propertyData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        listingType: data.listingType,
        area: data.area,
        bedrooms: data.bedrooms !== null && data.bedrooms !== undefined
          ? data.bedrooms
          : null,
        bathrooms: data.bathrooms !== null && data.bathrooms !== undefined
          ? data.bathrooms
          : null,
        location: `${data.city || ""}, ${data.state || ""}`
          .trim()
          .replace(/^,\s*|,\s*$/g, "") ||
          data.location ||
          "",
        address: data.address,
        features: selectedFeatures,
        state: data.state,
        city: data.city,
        zipCode: data.zipCode,
        yearBuilt: data.yearBuilt,
        images: uploadedImageUrls // Real uploaded image URLs
      };

      const response = await createProperty(propertyData as any).unwrap();

      toast.success("Property created successfully with all images!");

      // Reset form and redirect
      reset();
      setSelectedImages([]);
      setSelectedFeatures([]);
      setSelectedState("");
      setSelectedCity("");
      setIsUploading(false);
      sessionStorage.removeItem('selectedImages');

      // Redirect to properties listing
      navigate("/properties", { replace: true });

    } catch (error: any) {
      console.error("Property creation error:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create property";
      toast.error(errorMessage);
      setIsUploading(false);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Add New Property
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the type of property you want to list
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {propertyCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="card-elevated p-8 text-center cursor-pointer group hover:shadow-[var(--shadow-large)] transition-all duration-300"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="w-16 h-16 btn-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {category.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Not sure which category? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryData = propertyCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const isSubmitting = isCreating;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToCategories}
            className="mb-4"
          >
            ← Back to Categories
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            Add {selectedCategoryData?.name}
          </h1>
          <p className="text-muted-foreground">
            Fill in the details for your{" "}
            {selectedCategoryData?.name.toLowerCase()}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter property title"
                  {...register("title")}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
                {errors.title && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Listing Type *
                </label>
                <MobileSelect
                  options={[
                    { value: "sale", label: "For Sale" },
                    { value: "rent", label: "For Rent" },
                  ]}
                  value={watch("listingType") || "sale"}
                  onValueChange={(value) => setValue("listingType", value as any)}
                  placeholder="Select listing type"
                  label="Listing Type"
                />
                {errors.listingType && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.listingType.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                placeholder="Describe your property..."
                {...register("description")}
                className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-foreground placeholder:text-muted-foreground"
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  placeholder="Street address"
                  {...register("address")}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
                {errors.address && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  State * {locationDetecting && <span className="text-xs text-muted-foreground ml-2">(detecting...)</span>}
                </label>
                <MobileSelect
                  value={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity("");
                    setValue(
                      "state",
                      indianStates.find((s) => s.isoCode === value)?.name || ""
                    );
                    setValue("city", "");
                  }}
                  placeholder="Select State"
                  options={indianStates.map((state) => ({
                    value: state.isoCode,
                    label: state.name,
                  }))}
                />
                {errors.state && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  City * {locationDetecting && <span className="text-xs text-muted-foreground ml-2">(detecting...)</span>}
                </label>
                <MobileSelect
                  value={selectedCity}
                  onValueChange={(value) => {
                    setSelectedCity(value);
                    setValue("city", value);
                  }}
                  placeholder="Select City"
                  disabled={!selectedState}
                  options={cities.map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))}
                />
                {errors.city && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ZIP Code {locationDetecting && <span className="text-xs text-muted-foreground ml-2">(detecting...)</span>}
                </label>
                <input
                  type="text"
                  placeholder="ZIP Code"
                  {...register("zipCode")}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="100000"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
                {errors.price && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Area (sqft) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="1000"
                  {...register("area", { valueAsNumber: true })}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
                {errors.area && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.area.message}
                  </p>
                )}
              </div>
              {(selectedCategory === "flat" ||
                selectedCategory === "house") && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bedrooms
                  </label>
                  <MobileSelect
                    options={[
                      { value: "0", label: "0" },
                      { value: "1", label: "1" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4" },
                      { value: "5", label: "5" },
                      { value: "6", label: "6+" },
                    ]}
                    value={watch("bedrooms")?.toString() || "0"}
                    onValueChange={(value) => setValue("bedrooms", parseInt(value))}
                    placeholder="Select bedrooms"
                    label="Bedrooms"
                  />
                  {errors.bedrooms && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.bedrooms.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {(selectedCategory === "flat" || selectedCategory === "house") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bathrooms
                  </label>
                  <MobileSelect
                    options={[
                      { value: "0", label: "0" },
                      { value: "1", label: "1" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4" },
                      { value: "5", label: "5" },
                      { value: "6", label: "6+" },
                    ]}
                    value={watch("bathrooms")?.toString() || "0"}
                    onValueChange={(value) => setValue("bathrooms", parseInt(value))}
                    placeholder="Select bathrooms"
                    label="Bathrooms"
                  />
                  {errors.bathrooms && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.bathrooms.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year Built
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2025"
                    placeholder="2020"
                    {...register("yearBuilt", { valueAsNumber: true })}
                    className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(() => {
                const featureIcons: Record<string, any> = {
                  Parking: Car,
                  Security: Shield,
                  "24/7 CCTV": Camera,
                  Elevator: DoorOpen,
                  "Air Conditioning": Snowflake,
                  Balcony: Wind,
                  Gym: Dumbbell,
                  "Swimming Pool": Waves,
                  "Power Backup": Zap,
                  Intercom: Phone,
                  "Maintenance Staff": Users,
                  "Children Play Area": Baby,
                  "Club House": HomeIcon,
                  "Visitor Parking": Car,
                  Garden: Leaf,
                  Garage: Warehouse,
                  Fireplace: Flame,
                  Terrace: Sun,
                  "Store Room": Box,
                  "Servant Room": Bed,
                  "Modular Kitchen": ChefHat,
                  "Private Pool": Waves,
                  "Solar Panels": Sun,
                  "Rain Water Harvesting": Droplets,
                  "Prime Location": MapPin,
                  "Corner Plot": MapPin,
                  "Wide Frontage": TrendingUp,
                  "Loading Dock": Truck,
                  Basement: Warehouse,
                  Washroom: Droplet,
                  "Mezzanine Floor": Upload,
                  "Fire Safety": AlertTriangle,
                  "High Ceiling": TrendingUp,
                  "Clear Title": FileCheck,
                  Fenced: Fence,
                  "Road Access": Route,
                  "Water Supply": Droplets,
                  Electricity: Zap,
                  Agricultural: Leaf,
                  "Residential Zone": Home,
                  "Commercial Zone": Store,
                  "Near Highway": Route,
                  "Gated Community": Shield,
                };

                const categoryFeatures = {
                  flat: [
                    "Parking",
                    "Security",
                    "24/7 CCTV",
                    "Elevator",
                    "Air Conditioning",
                    "Balcony",
                    "Gym",
                    "Swimming Pool",
                    "Power Backup",
                    "Intercom",
                    "Maintenance Staff",
                    "Children Play Area",
                    "Club House",
                    "Visitor Parking",
                  ],
                  house: [
                    "Parking",
                    "Security",
                    "24/7 CCTV",
                    "Garden",
                    "Garage",
                    "Air Conditioning",
                    "Fireplace",
                    "Terrace",
                    "Store Room",
                    "Servant Room",
                    "Modular Kitchen",
                    "Private Pool",
                    "Solar Panels",
                    "Rain Water Harvesting",
                  ],
                  shop: [
                    "Parking",
                    "Security",
                    "24/7 CCTV",
                    "Prime Location",
                    "Corner Plot",
                    "Wide Frontage",
                    "Loading Dock",
                    "Basement",
                    "Air Conditioning",
                    "Elevator",
                    "Washroom",
                    "Mezzanine Floor",
                    "Fire Safety",
                    "High Ceiling",
                  ],
                  land: [
                    "Clear Title",
                    "Fenced",
                    "Road Access",
                    "Water Supply",
                    "Electricity",
                    "Agricultural",
                    "Residential Zone",
                    "Commercial Zone",
                    "Corner Plot",
                    "Near Highway",
                    "Gated Community",
                  ],
                };

                const features =
                  categoryFeatures[
                    selectedCategory as keyof typeof categoryFeatures
                  ] || [];

                return features.map((feature) => {
                  const Icon = featureIcons[feature] || Building;
                  const isSelected = selectedFeatures.includes(feature);

                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background hover:border-primary/50 hover:bg-secondary"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mb-2 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-xs text-center font-medium">
                        {feature}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Property Images</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={handleChooseFiles}
            >
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Drop images here or click to upload
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChooseFiles();
                  }}
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 w-8 h-8 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-center space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/properties")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-gradient-primary"
              size="lg"
              disabled={isSubmitting || isUploading}
            >
              {isUploading ? "Uploading images..." : isCreating ? "Creating property..." : "Publish Property"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddProperty;
