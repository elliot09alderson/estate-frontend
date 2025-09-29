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
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  useCreatePropertyMutation,
} from "@/store/api-new";

const propertySchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be less than 2000 characters"),
  price: z.number().min(0, "Price must be 0 or greater"),
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const indianStates = State.getStatesOfCountry("IN");
  const cities = selectedState ? City.getCitiesOfState("IN", selectedState) : [];

  const [createProperty, { isLoading: isCreating }] =
    useCreatePropertyMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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
      setSelectedImages((prev) => [...prev, ...filesArray]);
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
      const formData = new FormData();

      // Append images
      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      // Append property data
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("listingType", data.listingType);
      formData.append("area", data.area.toString());
      formData.append("bedrooms", data.bedrooms !== null && data.bedrooms !== undefined ? data.bedrooms.toString() : "null");
      formData.append("bathrooms", data.bathrooms !== null && data.bathrooms !== undefined ? data.bathrooms.toString() : "null");
      formData.append(
        "location",
        `${data.city || ""}, ${data.state || ""}`
          .trim()
          .replace(/^,\s*|,\s*$/g, "") || data.location || ""
      );
      formData.append("address", data.address);
      formData.append("features", JSON.stringify(selectedFeatures));

      await createProperty(formData as any).unwrap();

      toast.success("Property created successfully and is pending approval");

      // Clear form state
      reset();
      setSelectedImages([]);
      setSelectedFeatures([]);
      setSelectedState("");
      setSelectedCity("");

      // Navigate with replace to avoid adding to history
      navigate("/properties", { replace: true });
    } catch (error: any) {
      console.error("Property creation error:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create property";
      toast.error(errorMessage);
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
                <select
                  {...register("listingType")}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
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
                  State *
                </label>
                <select
                  {...register("state")}
                  value={selectedState}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedState(value);
                    setSelectedCity("");
                    setValue("state", indianStates.find(s => s.isoCode === value)?.name || "");
                    setValue("city", "");
                  }}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <select
                  {...register("city")}
                  value={selectedCity}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCity(value);
                    setValue("city", value);
                  }}
                  disabled={!selectedState}
                  className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ZIP Code
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
                  Price ($) *
                </label>
                <input
                  type="number"
                  placeholder="0"
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
                  placeholder="0"
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
                  <select
                    {...register("bedrooms", { valueAsNumber: true })}
                    className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6+</option>
                  </select>
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
                  <select
                    {...register("bathrooms", { valueAsNumber: true })}
                    className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6+</option>
                  </select>
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
              accept="image/*"
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
                      className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end space-x-4 pt-6">
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
              disabled={isSubmitting}
            >
              {isCreating ? "Creating property..." : "Publish Property"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;