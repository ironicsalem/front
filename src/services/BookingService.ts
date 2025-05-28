// BookingService.ts
interface Booking {
  _id: string;
  tourist: string;
  trip: {
    _id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    guide: {
      _id: string;
      fullName: string;
    };
  };
  guide: string;
  status: 'pending' | 'confirmed' | 'canceled';
  contactPhone: string;
  contactEmail: string;
  scheduledDate: string | Date;
  scheduledTime: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

class BookingService {
  private static baseURL = 'http://localhost:3000';

  static async getMyBookings(): Promise<Booking[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/booking/myBookings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async cancelBooking(bookingId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/booking/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  }

  static async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}/booking/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export default BookingService;
export type { Booking };