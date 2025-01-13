import React, { useEffect, useState } from 'react';
import { useApiGet } from "@/services/api.service";
import { User } from '@/types/user.types';

interface ApiUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  created_at: string;
  updated_at: string;
}

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);

  // Setup authenticated API call
  const { execute: fetchProfile, isLoading } = useApiGet<ApiUser>('/users/me');

  useEffect(() => {
    fetchProfile().then(userProfile => {
      if (userProfile) {
        setProfile({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          avatarUrl: userProfile.picture,
          createdAt: new Date(userProfile.created_at),
          updatedAt: new Date(userProfile.updated_at)
        });
      }
    });
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
      </div>
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.name || 'Profile'}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-white">{profile.name}</h3>
              <p className="text-gray-400">{profile.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 