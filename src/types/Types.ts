// Base types
export type UserRole = 'tourist' | 'guide' | 'admin';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'canceled'; // Updated to match backend
export type TripType = 'Adventure' | 'Cultural' | 'Food' | 'Historical' | 'Nature' | 'Relaxation' | 'Group';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

// Location interface
export interface Location {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

// Start Location interface (for GeoJSON Point)
export interface StartLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  description?: string;
}

// User interfaces
export interface UserInteractions {
  likedPosts: string[];
  comments: string[];
  reviews: string[];
}

export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  posts: string[];
  bookings: string[];
  profilePicture: string;
  bio: string;
  userInteractions: UserInteractions;
  emailVerificationCode: string;
  emailVerificationCodeExpires?: Date;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User with populated references
export interface PopulatedUser extends Omit<BaseUser, 'posts' | 'bookings' | 'userInteractions'> {
  posts: Post[];
  bookings: Booking[];
  userInteractions: {
    likedPosts: Post[];
    comments: Comment[];
    reviews: Review[];
  };
}

// Tourist interface (extends User via discriminator)
export interface Tourist extends BaseUser {
  role: 'tourist';
}

// Admin interface
export interface Admin extends BaseUser {
  role: 'admin';
  permissions: string[];
}

// Guide interfaces
export interface GuideRating {
  user: string;
  value: number;
}

export interface Guide {
  _id: string;
  city: string;
  userId: string;
  ratings: GuideRating[];
  averageRating: number;
  reviews: string[];
  plannedTrips: string[];
  languages: string[];
  behavioralCertificate: string;
  nationalId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Guide with populated references
export interface PopulatedGuide extends Omit<Guide, 'userId' | 'reviews' | 'plannedTrips'> {
  userId: BaseUser;
  reviews: Review[];
  plannedTrips: Trip[];
}

// Trip interfaces
export interface TripSchedule {
  date: Date;
  time: string;
  isAvailable: boolean;
}

export interface Trip {
  _id: string;
  title: string;
  guide: Guide;
  city: string;
  path: Location[];
  schedule: TripSchedule[];
  startLocation: StartLocation;
  isAvailable: boolean;
  imageUrl?: string;
  price: number;
  description: string;
  type: TripType;
  createdAt: Date;
  updatedAt: Date;
}

// Trip with populated references
export interface PopulatedTrip extends Omit<Trip, 'guide'> {
  guide: Guide | PopulatedGuide;
}

// Booking interfaces - Updated to match backend
export interface Booking {
  _id: string;
  tourist: string;
  trip: string;
  guide: string;
  status: BookingStatus; // Changed from bookingStatus to status to match backend
  scheduledDate: Date;
  scheduledTime: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking with populated references
export interface PopulatedBooking extends Omit<Booking, 'tourist' | 'trip' | 'guide'> {
  tourist: BaseUser;
  trip: Trip;
  guide: Guide;
}

// Review interfaces - Updated to match backend
export interface Review {
  _id: string;
  content: string;
  rating: number;
  author: string;
  guide: string;
  images: string[]; // Added images field from backend
  createdAt: Date;
  updatedAt: Date;
}

// Review with populated references
export interface PopulatedReview extends Omit<Review, 'author' | 'guide'> {
  author: BaseUser;
  guide: Guide;
}

// Post interfaces
export interface Post {
  _id: string;
  title: string;
  content?: string;
  images: string[];
  author: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Post with populated references
export interface PopulatedPost extends Omit<Post, 'author'> {
  author: BaseUser;
}

// Comment interfaces
export interface Comment {
  _id: string;
  content: string;
  author: string;
  post: string;
  createdAt: Date;
  updatedAt: Date;
}

// Comment with populated references
export interface PopulatedComment extends Omit<Comment, 'author' | 'post'> {
  author: BaseUser;
  post: Post;
}

// Station interface
export interface Station {
  _id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Application interface
export interface Application {
  _id: string;
  city: string;
  userId: string;
  languages: string[];
  behavioralCertificate: string;
  nationalId: string;
  nationalIdPicture: string;
  specialties: string[];
  status: ApplicationStatus;
}

// Application with populated references
export interface PopulatedApplication extends Omit<Application, 'userId'> {
  userId: BaseUser;
}

// Form interfaces for creating/updating resources
export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
  bio?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
}

// Updated CreateBookingRequest to match backend
export interface CreateBookingRequest {
  tourist: string;
  trip: string;
  guide: string;
  scheduledDate: Date;
  scheduledTime: string;
  contactPhone: string;
  contactEmail: string;
}

export interface CreateTripRequest {
  title: string;
  guide: string;
  city: string;
  path: Location[];
  schedule: TripSchedule[];
  startLocation: StartLocation;
  isAvailable?: boolean;
  imageUrl?: string;
  price: number;
  description: string;
  type: TripType;
}

// Updated CreateReviewRequest to include images
export interface CreateReviewRequest {
  content: string;
  rating: number;
  author: string;
  guide: string;
  images?: string[];
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  images?: string[];
  author: string;
}

export interface CreateCommentRequest {
  content: string;
  author: string;
  post: string;
}

export interface CreateApplicationRequest {
  city: string;
  userId: string;
  languages: string[];
  behavioralCertificate: string;
  nationalId: string;
  nationalIdPicture: string;
  specialties: string[];
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: BaseUser;
  token: string;
}

export interface RegisterResponse {
  user: BaseUser;
  token: string;
}