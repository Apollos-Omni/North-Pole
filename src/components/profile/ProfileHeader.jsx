import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  MapPin, 
  Link as LinkIcon, 
  Crown, 
  Copy,
  ExternalLink,
  Shield,
  Star
} from "lucide-react";

const karmaLevelColors = {
  "Seeker": "from-gray-400 to-gray-600",
  "Guardian": "from-blue-400 to-blue-600",
  "Mystic": "from-purple-400 to-purple-600", 
  "Divine": "from-yellow-400 to-yellow-600"
};

const kycTierLabels = {
  0: { label: 'Unverified', color: 'bg-gray-600/20 text-gray-300', icon: null },
  1: { label: 'Basic Verified', color: 'bg-blue-600/20 text-blue-300', icon: Shield },
  2: { label: 'Fully Verified', color: 'bg-green-600/20 text-green-300', icon: Crown }
};

export default function ProfileHeader({ user, profile, stats, isOwnProfile, onEdit, onCopyHandle }) {
  const kycInfo = kycTierLabels[profile.kyc_tier || 0];
  const IntegrityIcon = kycInfo.icon;

  return (
    <Card className="mb-8 bg-gradient-to-br from-[rgb(var(--grey-1))] to-[rgb(var(--grey-2))] border-[rgb(var(--grey-3))]/20 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${karmaLevelColors[user.karma_level || 'Seeker']} p-1 shadow-lg`}>
              <div className="w-full h-full rounded-full bg-[rgb(var(--dark-base))] flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <Crown className="w-8 h-8 md:w-12 md:h-12 text-purple-400" />
                )}
              </div>
            </div>
            {/* Karma Level Badge */}
            <div className="absolute -bottom-2 -right-2">
              <Badge className={`bg-gradient-to-r ${karmaLevelColors[user.karma_level || 'Seeker']} text-white border-0 text-xs px-2 py-1`}>
                <Star className="w-3 h-3 mr-1" />
                {user.karma_level || 'Seeker'}
              </Badge>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[rgb(var(--accent-soft-white))]">
                  {user.full_name || 'Anonymous Seeker'}
                </h1>
                {isOwnProfile && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onEdit}
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={onCopyHandle}
                  className="flex items-center gap-1 text-[rgb(var(--grey-3))] hover:text-purple-300 transition-colors"
                >
                  @{user.full_name?.replace(/\s+/g, '').toLowerCase() || 'user'}
                  <Copy className="w-3 h-3" />
                </button>

                {profile.region && (
                  <div className="flex items-center gap-1 text-[rgb(var(--grey-3))]">
                    <MapPin className="w-4 h-4" />
                    {profile.region}
                  </div>
                )}

                {/* KYC/Identity Badge */}
                <Badge className={`${kycInfo.color} border-0`}>
                  {IntegrityIcon && <IntegrityIcon className="w-3 h-3 mr-1" />}
                  {kycInfo.label}
                </Badge>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-[rgb(var(--accent-soft-white))]/90 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Links */}
            {profile.links && profile.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {profile.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-[rgb(var(--grey-2))] hover:bg-[rgb(var(--grey-3))]/20 rounded-full text-sm text-purple-300 hover:text-purple-200 transition-all duration-200"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {link.label || link.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}

            {/* Follower/Following Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold text-[rgb(var(--accent-soft-white))]">
                  {stats.followerCount}
                </span>
                <span className="text-[rgb(var(--grey-3))] ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold text-[rgb(var(--accent-soft-white))]">
                  {stats.supportingCount}
                </span>
                <span className="text-[rgb(var(--grey-3))] ml-1">supporting</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}