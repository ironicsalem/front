// TripSchedule.tsx
import React, { useState } from 'react';
import { TripData, Schedule } from '../CreateTrip';

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
    
    if (isTimeSlotSelected(date, time)) {
      // Remove this time slot
      const updatedSchedule = tripData.schedule.filter(
        s => !(s.date.toDateString() === date.toDateString() && s.time === time)
      );
      updateTripData({ schedule: updatedSchedule });
    } else {
      // Add this time slot
      const newScheduleItem: Schedule = {
        date: new Date(date),
        time,
        isAvailable: true
      };
      updateTripData({
        schedule: [...tripData.schedule, newScheduleItem]
      });
    }
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

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Trip Schedule</h2>
      
      <p className="text-gray-600 mb-4">
        Select dates and times for your trip schedule.
        {tripData.schedule.length === 0 && (
          <span className="text-red-500 ml-1">At least one scheduled time is required.</span>
        )}
      </p>
      
      {/* Month/Year Selector */}
      <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-md border border-gray-200">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100"
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
            className="px-2 py-1 border border-gray-300 rounded"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          
          <select 
            value={viewDate.getFullYear()}
            onChange={handleYearChange}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
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
        <div className="grid grid-cols-7 border-b">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`p-1 min-h-[80px] border-b border-r ${!day || isPastDate(day) ? 'bg-gray-50' : 'hover:bg-orange-50'}`}
            >
              {day && (
                <div 
                  className={`relative ${isPastDate(day) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div 
                    className={`
                      text-right mb-1 p-1 rounded-full w-7 h-7 flex items-center justify-center ml-auto
                      ${isToday(day) ? 'bg-blue-500 text-white' : ''}
                      ${hasScheduledTimes(day) && !isToday(day) ? 'bg-orange-400 text-white' : ''}
                    `}
                  >
                    {day.getDate()}
                  </div>
                  
                  {/* Scheduled time indicators */}
                  {hasScheduledTimes(day) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {getScheduledTimes(day).map((time, idx) => (
                        <div key={idx} className="text-xs px-1 py-0.5 bg-orange-100 text-orange-800 rounded">
                          {time}
                        </div>
                      ))}
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
              <div key={dateString} className="p-3 border border-gray-200 rounded-md">
                <div className="font-medium text-gray-800">
                  {formatDate(new Date(dateString))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      <span>{item.time}</span>
                      <button
                        className="ml-2 text-orange-800 hover:text-orange-900"
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select Time Slots</h3>
              <button
                className="p-1 text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
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
            
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">Available time slots:</div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(time => {
                  const isSelected = selectedDate ? 
                    isTimeSlotSelected(selectedDate, time) || selectedTimeSlots.includes(time) : 
                    false;
                    
                  return (
                    <div 
                      key={time}
                      className={`cursor-pointer border rounded-md p-2 text-center text-sm hover:bg-orange-50
                        ${isSelected ? 'bg-orange-400 text-white' : ''}
                      `}
                      onClick={() => {
                        if (selectedTimeSlots.includes(time)) {
                          setSelectedTimeSlots(prev => prev.filter(t => t !== time));
                        } else {
                          setSelectedTimeSlots(prev => [...prev, time]);
                        }
                      }}
                    >
                      {time}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTimeSlots([]);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500"
                onClick={() => {
                  if (selectedDate) {
                    // Add or remove time slots
                    selectedTimeSlots.forEach(time => {
                      const alreadySelected = isTimeSlotSelected(selectedDate, time);
                      if (!alreadySelected) {
                        // Add this time slot
                        const newScheduleItem: Schedule = {
                          date: new Date(selectedDate),
                          time,
                          isAvailable: true
                        };
                        updateTripData({
                          schedule: [...tripData.schedule, newScheduleItem]
                        });
                      }
                    });
                  }
                  
                  // Close modal and reset
                  setShowModal(false);
                  setSelectedTimeSlots([]);
                }}
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