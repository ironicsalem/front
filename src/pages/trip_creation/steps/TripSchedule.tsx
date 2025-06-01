// TripSchedule.tsx
import React, { useState } from 'react';
import { TripData, Schedule } from '../CreateTrip';
import { TripType } from '../../../types/Types';
import TripService from '../../../services/TripService';

interface TripScheduleProps {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
}

const TripSchedule: React.FC<TripScheduleProps> = ({ tripData, updateTripData }) => {
  // State to manage the calendar view
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(today);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string>('');
  
  // Time slot options
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  // Generate month names array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate years array (current year + 5 years into the future)
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Helper function to convert internal coordinates to GeoJSON format
  const convertToGeoJSONCoordinates = (position: { lat?: number; lng?: number }): [number, number] => {
    if (!position.lat || !position.lng) {
      return [35.9106, 31.9539]; // Default Jordan coordinates [lng, lat]
    }
    return [position.lng, position.lat]; // GeoJSON format: [longitude, latitude]
  };

  // Helper function to create StartLocation from current trip data
  const createStartLocationFromPath = () => {
    if (tripData.path && tripData.path.length > 0 && tripData.path[0].position.lat && tripData.path[0].position.lng) {
      return {
        type: 'Point' as const,
        coordinates: convertToGeoJSONCoordinates(tripData.path[0].position)
      };
    }
    
    // Default to Jordan coordinates if no path or coordinates
    return {
      type: 'Point' as const,
      coordinates: [35.9106, 31.9539] as [number, number] // Amman, Jordan [lng, lat]
    };
  };
  
  // Validate schedule using TripService with new GeoJSON format
  const validateSchedule = (schedule: Schedule[]): string | null => {
    if (schedule.length === 0) {
      return 'At least one schedule item is required';
    }
    
    // Create a minimal trip data object for validation using new GeoJSON format
    const validationData = {
      title: tripData.title || 'temp',
      city: tripData.city || 'temp',
      price: tripData.price || 1,
      description: tripData.description || 'temp description',
      type: tripData.type || 'Cultural' as TripType,
      schedule: schedule,
      path: tripData.path || [],
      startLocation: createStartLocationFromPath()
    };

    const validationErrors = TripService.validateTripData(validationData);
    const scheduleError = validationErrors.find(error => 
      error.toLowerCase().includes('schedule')
    );
    
    return scheduleError || null;
  };

  // Update schedule with validation
  const updateScheduleWithValidation = (newSchedule: Schedule[]) => {
    const error = validateSchedule(newSchedule);
    setValidationError(error || '');
    updateTripData({ schedule: newSchedule });
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(parseInt(e.target.value));
    setViewDate(newDate);
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(parseInt(e.target.value));
    setViewDate(newDate);
  };

  // Generate calendar days for the current view month
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Calendar grid (6 weeks × 7 days)
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    
    return calendarDays;
  };
  
  // Check if a date has any scheduled times
  const hasScheduledTimes = (date: Date): boolean => {
    if (!date) return false;
    
    return tripData.schedule.some(
      s => s.date.toDateString() === date.toDateString()
    );
  };
  
  // Get scheduled times for a date
  const getScheduledTimes = (date: Date): string[] => {
    if (!date) return [];
    
    return tripData.schedule
      .filter(s => s.date.toDateString() === date.toDateString())
      .map(s => s.time);
  };
  
  // Check if a specific time slot is selected for a date
  const isTimeSlotSelected = (date: Date, time: string): boolean => {
    if (!date) return false;
    
    return tripData.schedule.some(
      s => s.date.toDateString() === date.toDateString() && s.time === time
    );
  };
  
  // Toggle a time slot for a date
  const toggleTimeSlot = (date: Date, time: string): void => {
    if (!date) return;
    
    let updatedSchedule: Schedule[];
    
    if (isTimeSlotSelected(date, time)) {
      // Remove this time slot
      updatedSchedule = tripData.schedule.filter(
        s => !(s.date.toDateString() === date.toDateString() && s.time === time)
      );
    } else {
      // Add this time slot
      const newScheduleItem: Schedule = {
        date: new Date(date),
        time,
        isAvailable: true
      };
      updatedSchedule = [...tripData.schedule, newScheduleItem];
    }
    
    updateScheduleWithValidation(updatedSchedule);
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Group schedule by date
  const groupScheduleByDate = () => {
    const grouped: Record<string, Schedule[]> = {};
    
    tripData.schedule.forEach(item => {
      const dateString = item.date.toDateString();
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(item);
    });
    
    return grouped;
  };
  
  // Remove all schedule items for a specific date
  const removeAllScheduleForDate = (dateString: string): void => {
    const updatedSchedule = tripData.schedule.filter(
      item => item.date.toDateString() !== dateString
    );
    updateScheduleWithValidation(updatedSchedule);
  };
  
  const scheduledDates = groupScheduleByDate();
  const calendarDays = generateCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Function to check if a date is today
  const isToday = (date: Date): boolean => {
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  };
  
  // Function to check if a date is in the past
  const isPastDate = (date: Date): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle modal save with validation
  const handleModalSave = (): void => {
    if (!selectedDate) return;
    
    let updatedSchedule = [...tripData.schedule];
    
    // Remove existing time slots for this date
    updatedSchedule = updatedSchedule.filter(
      s => s.date.toDateString() !== selectedDate.toDateString()
    );
    
    // Add selected time slots
    selectedTimeSlots.forEach(time => {
      const newScheduleItem: Schedule = {
        date: new Date(selectedDate),
        time,
        isAvailable: true
      };
      updatedSchedule.push(newScheduleItem);
    });
    
    updateScheduleWithValidation(updatedSchedule);
    
    // Close modal and reset
    setShowModal(false);
    setSelectedTimeSlots([]);
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Trip Schedule</h2>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Select dates and times for your trip schedule.
        </p>
        {validationError && (
          <p className="text-red-500 mt-2 font-medium">{validationError}</p>
        )}
        {tripData.schedule.length === 0 && !validationError && (
          <p className="text-red-500 mt-2">At least one scheduled time is required.</p>
        )}
      </div>
      
      {/* Month/Year Selector */}
      <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-md border border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Previous Month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <div className="flex space-x-2">
          <select 
            value={viewDate.getMonth()}
            onChange={handleMonthChange}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          
          <select 
            value={viewDate.getFullYear()}
            onChange={handleYearChange}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Next Month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`p-1 min-h-[80px] border-b border-r last:border-r-0 ${
                !day || isPastDate(day) 
                  ? 'bg-gray-50' 
                  : 'hover:bg-orange-50 transition-colors'
              }`}
            >
              {day && (
                <div 
                  className={`relative ${
                    isPastDate(day) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                >
                  <div 
                    className={`
                      text-right mb-1 p-1 rounded-full w-7 h-7 flex items-center justify-center ml-auto text-sm font-medium
                      ${isToday(day) ? 'bg-blue-500 text-white' : ''}
                      ${hasScheduledTimes(day) && !isToday(day) ? 'bg-orange-400 text-white' : ''}
                      ${!hasScheduledTimes(day) && !isToday(day) ? 'text-gray-700' : ''}
                    `}
                  >
                    {day.getDate()}
                  </div>
                  
                  {/* Scheduled time indicators */}
                  {hasScheduledTimes(day) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {getScheduledTimes(day).slice(0, 2).map((time, idx) => (
                        <div key={idx} className="text-xs px-1 py-0.5 bg-orange-100 text-orange-800 rounded">
                          {time}
                        </div>
                      ))}
                      {getScheduledTimes(day).length > 2 && (
                        <div className="text-xs px-1 py-0.5 bg-orange-100 text-orange-800 rounded">
                          +{getScheduledTimes(day).length - 2}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Click handling on non-past dates */}
                  {!isPastDate(day) && (
                    <div 
                      className="absolute inset-0" 
                      onClick={() => {
                        setSelectedDate(day);
                        setShowModal(true);
                        setSelectedTimeSlots(getScheduledTimes(day));
                      }}
                    ></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected dates summary */}
      {Object.keys(scheduledDates).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Selected Dates & Times</h3>
          <div className="space-y-3">
            {Object.entries(scheduledDates).map(([dateString, items]) => (
              <div key={dateString} className="p-4 border border-gray-200 rounded-md bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-800">
                    {formatDate(new Date(dateString))}
                  </div>
                  <button
                    onClick={() => removeAllScheduleForDate(dateString)}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                    title="Remove all times for this date"
                  >
                    Remove all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      <span>{item.time}</span>
                      <button
                        className="ml-2 text-orange-800 hover:text-orange-900 transition-colors"
                        onClick={() => toggleTimeSlot(item.date, item.time)}
                        title="Remove this time slot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Time slot modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select Time Slots</h3>
              <button
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTimeSlots([]);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">Selected date:</div>
              <div className="font-medium">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">Available time slots:</div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(time => {
                  const isSelected = selectedTimeSlots.includes(time);
                    
                  return (
                    <button
                      key={time}
                      className={`border rounded-md p-2 text-center text-sm transition-colors
                        ${isSelected 
                          ? 'bg-orange-400 text-white border-orange-400' 
                          : 'hover:bg-orange-50 border-gray-300'
                        }
                      `}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTimeSlots(prev => prev.filter(t => t !== time));
                        } else {
                          setSelectedTimeSlots(prev => [...prev, time]);
                        }
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTimeSlots([]);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors"
                onClick={handleModalSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional functionality section */}
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
        <p className="mb-2"><strong>Tip:</strong> Click on a date to select multiple time slots at once.</p>
        <p>You can schedule dates up to 5 years in advance, allowing for flexible booking options.</p>
      </div>
    </div>
  );
};

export default TripSchedule;