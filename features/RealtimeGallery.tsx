import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Photo } from '../types';

interface RealtimeGalleryProps {
  weddingId: string;
  mode?: 'grid' | 'live-feed'; // Grid for mobile, Live Feed for big screen
}

export const RealtimeGallery: React.FC<RealtimeGalleryProps> = ({ weddingId, mode = 'grid' }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(mode === 'live-feed' ? 50 : 20); // Limit for performance

      if (!error && data) {
        setPhotos(data as Photo[]);
      }
      setLoading(false);
    };

    fetchPhotos();

    // 2. Realtime Subscription
    const channel = supabase
      .channel(`wedding-photos-${weddingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
          filter: `wedding_id=eq.${weddingId}`,
        },
        (payload) => {
          console.log('New photo received!', payload);
          const newPhoto = payload.new as Photo;
          
          if (!newPhoto.is_hidden) {
            setPhotos((prev) => [newPhoto, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weddingId, mode]);

  if (loading) return <div className="p-4 text-center text-stone-500">Loading gallery...</div>;

  if (photos.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-300">
        <p className="text-stone-500">No photos yet. Be the first to upload!</p>
      </div>
    );
  }

  if (mode === 'live-feed') {
    // A simplified masonry or slideshow view for venue screens
    // For this demo, we'll use a large auto-scrolling grid
    return (
      <div className="h-screen bg-black overflow-hidden relative">
         <h1 className="absolute top-4 left-8 text-white text-3xl font-bold z-10 drop-shadow-md">
           Live Wedding Feed
         </h1>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 h-full animate-pulse-slow">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl border-2 border-white/20">
                <img
                  src={photo.display_url}
                  alt={`By ${photo.uploader_name}`}
                  className="w-full h-full object-cover transition-transform duration-1000 transform hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-medium text-lg">{photo.uploader_name}</p>
                </div>
              </div>
            ))}
         </div>
      </div>
    );
  }

  // Standard Mobile Grid
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 my-6">
      {photos.map((photo) => (
        <div key={photo.id} className="relative aspect-square group overflow-hidden rounded-lg bg-stone-100 cursor-pointer">
          <img
            src={photo.display_url}
            alt={`Uploaded by ${photo.uploader_name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <span className="absolute bottom-1 right-2 text-xs text-white drop-shadow opacity-0 group-hover:opacity-100 transition-opacity">
            {photo.uploader_name}
          </span>
        </div>
      ))}
    </div>
  );
};
