export interface Wedding {
  id: string;
  host_id: string;
  slug: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  location: string;
  welcome_message: string;
  created_at: string;
}

export interface Photo {
  id: string;
  wedding_id: string;
  uploader_name: string;
  original_url: string;
  display_url: string;
  is_hidden: boolean;
  created_at: string;
}

export interface GuestbookEntry {
  id: string;
  wedding_id: string;
  writer_name: string;
  message: string;
  created_at: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'compressing' | 'uploading' | 'completed' | 'error';
}
