import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageCircle, Share2, Target, Crown } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const postTypeIcons = {
  vision_share: Target,
  karma_milestone: Crown,
  hinge_activity: Users,
  general: MessageCircle
};

const postTypeColors = {
  vision_share: "bg-purple-100 text-purple-800",
  karma_milestone: "bg-yellow-100 text-yellow-800",
  hinge_activity: "bg-blue-100 text-blue-800",
  general: "bg-gray-100 text-gray-800"
};

export default function CommunityFeed({ posts }) {
  return (
    <Card className="bg-gradient-to-br from-white to-green-50 border-2 border-green-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
            <Users className="w-6 h-6 text-green-600" />
            Community Feed
          </CardTitle>
          <Link 
            to={createPageUrl("Community")} 
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View All →
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {posts.slice(0, 3).map((post) => {
            const PostIcon = postTypeIcons[post.post_type];
            return (
              <div key={post.id} className="p-4 bg-white/70 rounded-xl border border-green-100 hover:border-green-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <PostIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {post.created_by?.split('@')[0] || 'Community Member'}
                      </span>
                      <Badge className={`${postTypeColors[post.post_type]} border text-xs`}>
                        {post.post_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{format(new Date(post.created_date), 'MMM d')}</span>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart className="w-3 h-3" />
                          {post.likes || 0}
                        </button>
                        {post.karma_impact > 0 && (
                          <span className="text-yellow-600 font-medium">
                            +{post.karma_impact} karma
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {posts.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No community posts yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}