import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfileMutation, useGetProfileQuery } from '@/store/api-new';
import { toast as sonnerToast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();

  // Fetch fresh profile data
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();

  // Use profile data from query if available, otherwise use auth context
  const profileUser = profileData?.data || user;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profileUser?.name || '',
    phone: profileUser?.phone || '',
    companyName: profileUser?.companyName || '',
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Update form data when profile data changes
  useEffect(() => {
    if (profileUser) {
      setFormData({
        name: profileUser.name || '',
        phone: profileUser.phone || '',
        companyName: profileUser.companyName || '',
      });
    }
  }, [profileUser]);

  const handleSave = async () => {
    try {
      const updateData: any = {
        name: formData.name,
      };

      // Only include phone if it's provided
      if (formData.phone) {
        updateData.phone = formData.phone;
      }

      // Only include companyName if user is agent/admin and it's provided
      if ((profileUser?.role === 'agent' || profileUser?.role === 'admin') && formData.companyName) {
        updateData.companyName = formData.companyName;
      }

      await updateProfile(updateData).unwrap();

      sonnerToast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      sonnerToast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Show loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={!isEditing ? "btn-gradient-primary" : ""}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="card-elevated p-6 lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileUser?.avatar || undefined} alt={profileUser?.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profileUser?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-1">{profileUser?.name}</h2>
                <p className="text-muted-foreground mb-4 capitalize">{profileUser?.role}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    {profileUser?.email}
                  </div>
                  <div className="flex items-center justify-center text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    Member since {new Date(profileUser?.createdAt || '').getFullYear()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Profile Details */}
            <Card className="card-elevated p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    ) : (
                      <p className="p-3 bg-secondary rounded-lg">{profileUser?.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <p className="p-3 bg-secondary rounded-lg text-muted-foreground">{profileUser?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    {isEditing ? (
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                      />
                    ) : (
                      <p className="p-3 bg-secondary rounded-lg">{profileUser?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  {(profileUser?.role === 'agent' || profileUser?.role === 'admin') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name</label>
                      {isEditing ? (
                        <Input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter company name"
                        />
                      ) : (
                        <p className="p-3 bg-secondary rounded-lg">{profileUser?.companyName || 'Not provided'}</p>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        setFormData({
                          name: profileUser?.name || '',
                          phone: profileUser?.phone || '',
                          companyName: profileUser?.companyName || '',
                        });
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="btn-gradient-primary"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Statistics for Agents */}
          {profileUser?.role === 'agent' && (
            <Card className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">Agent Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Active Listings</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">5</div>
                  <div className="text-sm text-muted-foreground">Sold This Month</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-primary">4.8</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;