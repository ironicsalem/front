import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

interface Guide {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
  };
  city: string;
  languages: string[];
  behavioralCertificate?: string;
  averageRating: number;
}

interface Trip {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  locations: string[];
  image: string;
}

interface Review {
  _id: string;
  author: {
    name: string;
    profilePicture?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
}

const GuideProfileView = () => {
  const { guideId } = useParams<{ guideId: string }>();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        const res = await axios.get(`${API_URL}/guide/${guideId}`);
        setGuide(res.data);
      } catch (err) {
        console.error('Error fetching guide:', err);
      }
    };

    const fetchTrips = async () => {
      try {
        const res = await axios.get(`${API_URL}/guide/${guideId}/trips`);
        setTrips(res.data || []);
      } catch (err) {
        console.error('Error fetching trips:', err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/guide/${guideId}/reviews`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
    fetchTrips();
    fetchReviews();
  }, [guideId]);

  // if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!guide) return <div className="p-6 text-center text-red-500">Guide not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Profile Info */}
      <div className="bg-white shadow rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <img
          src={guide.userId.profilePicture || '/NoPic.jpg'}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold">{guide.userId.name}</h2>
          <p className="text-gray-600 text-sm">{guide.city}</p>
          <p className="text-gray-700 mt-2">{guide.userId.bio || 'No bio provided'}</p>
          <p className="mt-2 text-sm text-gray-500">Languages: {guide.languages.join(', ')}</p>
          <p className="mt-1 text-sm text-yellow-600">⭐ {guide.averageRating.toFixed(1)} / 5</p>
          {guide.behavioralCertificate && (
            <a
              href={guide.behavioralCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-500 underline text-sm"
            >
              View Behavioral Certificate
            </a>
          )}
        </div>
      </div>

      {/* Trips */}
      <div>
        <h3 className="text-xl font-bold mb-4">Trips</h3>
        {trips.length === 0 ? (
          <p className="text-gray-500">No trips available from this guide.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-lg shadow p-4">
                <img src={trip.image} alt={trip.title} className="w-full h-40 object-cover rounded-md mb-2" />
                <h4 className="font-semibold">{trip.title}</h4>
                <p className="text-sm text-gray-600">{trip.description}</p>
                <p className="text-sm mt-1">📍 {trip.locations.join(', ')}</p>
                <p className="text-sm text-amber-600 mt-1">💰 {trip.price} USD - ⏱ {trip.duration}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <h3 className="text-xl font-bold mb-4">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white shadow rounded-md p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={review.author.profilePicture || '/NoPic.jpg'}
                    alt={review.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm">{review.author.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-yellow-600 text-sm">⭐ {review.rating} / 5</p>
                <p className="text-sm text-gray-700 mt-1">{review.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideProfileView;
