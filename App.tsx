import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { PhotoUpload } from './features/PhotoUpload';
import { RealtimeGallery } from './features/RealtimeGallery';
import { Guestbook } from './features/Guestbook';
import { supabase } from './services/supabase';
import { Wedding } from './types';
import { Heart, MapPin, Calendar } from 'lucide-react';

// --- Components for Routes ---

const Home = () => (
  <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
      <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <h1 className="text-3xl font-serif text-stone-900 mb-2">Smart Wedding</h1>
      <p className="text-stone-600 mb-8">Create your digital wedding invitation and archive.</p>
      
      <div className="space-y-3">
        <Link to="/jihun-wedding" className="block w-full py-3 px-4 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition">
          View Demo Wedding
        </Link>
        <Link to="/jihun-wedding/live" className="block w-full py-3 px-4 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-900 transition">
          View Live Screen Demo
        </Link>
      </div>
      <p className="mt-6 text-xs text-stone-400">Powered by Next.js, Supabase & R2</p>
    </div>
  </div>
);

const WeddingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching wedding details based on slug
    // In real app: supabase.from('weddings').select('*').eq('slug', slug).single()
    const fetchWedding = async () => {
      // MOCK DATA for demo purposes
      if (slug === 'jihun-wedding') {
        setWedding({
          id: '123e4567-e89b-12d3-a456-426614174000',
          host_id: 'host-1',
          slug: 'jihun-wedding',
          groom_name: 'Jihun',
          bride_name: 'Sarah',
          wedding_date: '2024-10-24',
          location: 'Grand Hotel, Seoul',
          welcome_message: 'We are so excited to celebrate with you!',
          created_at: new Date().toISOString()
        });
      }
      setLoading(false);
    };
    fetchWedding();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center text-stone-500">Loading...</div>;
  if (!wedding) return <div className="h-screen flex items-center justify-center text-stone-500">Wedding not found.</div>;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Hero Section */}
      <div className="bg-white pb-8 rounded-b-[2rem] shadow-sm">
        <div className="h-48 bg-rose-100 w-full relative overflow-hidden">
          <img 
            src="https://picsum.photos/800/400" 
            alt="Cover" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent"></div>
        </div>
        
        <div className="px-6 -mt-10 relative text-center">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
             <Heart className="w-8 h-8 text-rose-500 fill-current" />
          </div>
          <h1 className="text-3xl font-serif text-stone-900 mb-1">{wedding.groom_name} & {wedding.bride_name}</h1>
          <p className="text-rose-500 font-medium mb-4">Are getting married!</p>
          
          <div className="flex justify-center space-x-6 text-sm text-stone-600 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              {wedding.wedding_date}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              {wedding.location}
            </div>
          </div>
          
          <p className="text-stone-600 max-w-sm mx-auto leading-relaxed italic">
            "{wedding.welcome_message}"
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        <PhotoUpload weddingId={wedding.id} slug={wedding.slug} />
        
        <div className="my-8">
          <h2 className="text-xl font-serif text-stone-800 mb-4 px-2 border-l-4 border-rose-500">
            Gallery
          </h2>
          <RealtimeGallery weddingId={wedding.id} />
        </div>

        <div className="border-t border-stone-200 pt-8">
          <Guestbook weddingId={wedding.id} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 flex justify-center text-xs text-stone-400">
        Smart Wedding Invitation
      </div>
    </div>
  );
};

const LiveFeedPage = () => {
  const { slug } = useParams<{ slug: string }>();
  // For demo, hardcoded ID
  const weddingId = '123e4567-e89b-12d3-a456-426614174000';

  return (
    <RealtimeGallery weddingId={weddingId} mode="live-feed" />
  );
};

// --- Main App ---

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:slug" element={<WeddingPage />} />
        <Route path="/:slug/live" element={<LiveFeedPage />} />
      </Routes>
    </HashRouter>
  );
}
