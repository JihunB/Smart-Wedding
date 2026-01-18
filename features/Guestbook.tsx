import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { GuestbookEntry } from '../types';
import { MessageSquare } from 'lucide-react';

interface GuestbookProps {
  weddingId: string;
}

export const Guestbook: React.FC<GuestbookProps> = ({ weddingId }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from('guestbooks')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });
      if (data) setEntries(data as GuestbookEntry[]);
    };
    fetchEntries();
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from('guestbooks')
      .insert({ wedding_id: weddingId, writer_name: name, message })
      .select()
      .single();

    if (!error && data) {
      setEntries([data as GuestbookEntry, ...entries]);
      setMessage('');
    }
    setSubmitting(false);
  };

  return (
    <div className="my-8">
      <h3 className="text-xl font-serif text-stone-800 mb-6 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        Guestbook
      </h3>

      <form onSubmit={handleSubmit} className="bg-stone-50 p-4 rounded-lg mb-6 border border-stone-200">
        <input
          className="w-full mb-3 px-3 py-2 border rounded border-stone-300"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full mb-3 px-3 py-2 border rounded border-stone-300 h-20"
          placeholder="Leave a sweet message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" disabled={submitting || !name || !message} className="w-full">
          Sign Guestbook
        </Button>
      </form>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100">
            <p className="text-stone-800 mb-2">{entry.message}</p>
            <p className="text-sm text-stone-500 font-medium">- {entry.writer_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
