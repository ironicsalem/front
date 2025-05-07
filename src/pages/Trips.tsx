import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

type Trip = {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: number;
  duration?: string;
};

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTrips = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/trip/trips?page=${currentPage}`);
      setTrips([...res.data.trips]);
      setHasNextPage(res.data.hasNextPage);  
    } catch (err) {
      console.error('Failed to fetch trips', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips(page);
  }, [page]);

  const loadMore = () => {
    if (hasNextPage && !loading) {
      setPage((prev) => prev + 1); 
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center relative inline-block">
        <span className="relative z-10 px-6">
          Explore Our Trips
        </span>
        <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
      </h1>

      {trips.length === 0 && !loading && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">No trips available at the moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trips.map((trip) => (
          <div 
            key={trip._id} 
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            onClick={() => navigate(`/trips/${trip._id}`)}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={trip?.imageUrl }
                alt={trip.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                {trip.duration && (
                  <span className="text-white font-medium">{trip.duration}</span>
                )}
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{trip.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
              <div className="flex justify-between items-center">
                {trip.price && (
                  <span className="text-amber-600 font-bold text-lg">${trip.price}</span>
                )}
                <button 
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-lg ${loading ? 'opacity-75' : ''}`}
          >
            {loading ? 'Loading...' : 'Load More Trips'}
          </button>
        </div>
      )}

      {!hasNextPage && trips.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">You've reached the end of our trips</p>
        </div>
      )}
    </div>
  );
}

export default TripsPage;
