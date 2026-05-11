export interface MomentData {
  occasion?: string;
  headline?: string;
  message: string;
  sender?: string;
  recipient?: string;
  photos?: string[];
  template?: string;
  music?: {
    track_id?: string;
    name?: string;
    artist_name?: string;
    album_image?: string;
  };
}
