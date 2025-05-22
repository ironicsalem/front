// User type definition that matches your backend User model
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'tourist' | 'guide' | 'admin';
  posts?: string[];
  bookings?: string[];
  profilePicture?: string;
  bio?: string;
  userInteractions?: {
    likedPosts?: string[];
    comments?: string[];
    reviews?: string[];
  };
  verified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: string | User;
  likes: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: string | User;
  post: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  content: string;
  rating: number;
  author: string | User;
  guide: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guide {
  _id: string;
  user: string | User;
  specialties: string[];
  languages: string[];
  experience: number;
  availability: {
    startDate: string;
    endDate: string;
  }[];
  ratings: {
    user: string;
    value: number;
  }[];
  averageRating: number;
  reviews: string[] | Review[];
  bio: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  tourist: string | User;
  guide: string | Guide;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}