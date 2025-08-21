import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Thermometer,
  Wind,
  Gauge,
  MapPin
} from 'lucide-react';
import { 
  fetchWeatherData, 
  WeatherData, 
  getWeatherIcon, 
  getWindDirectionIcon
} from '../services/weatherService';

interface CalendarProps {}

const Calendar: React.FC<CalendarProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      const data = await fetchWeatherData();
      setWeatherData(data);
      setLoading(false);
    };

    loadWeatherData();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday (0) to be last (6)
  };

  const getWeatherForDate = (date: Date): WeatherData | null => {
    const dateStr = date.toISOString().split('T')[0];
    return weatherData.find(w => w.date === dateStr) || null;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const weather = getWeatherForDate(date);
      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <motion.div
          key={day}
          className={`
            h-24 border border-gray-200 p-1 cursor-pointer relative overflow-hidden
            ${isPast ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:bg-ocean-50'}
            ${isCurrentDay ? 'ring-2 ring-ocean-500' : ''}
            ${isSelected ? 'bg-ocean-100 ring-2 ring-ocean-600' : ''}
          `}
          onClick={() => handleDateClick(date)}
          whileHover={!isPast ? { scale: 1.02 } : {}}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${isCurrentDay ? 'text-ocean-600' : 'text-gray-900'}`}>
                {day}
              </span>
              {weather && (
                <span className="text-lg">{getWeatherIcon(weather.weather_code)}</span>
              )}
            </div>
            
            {weather && !isNaN(weather.temperature_2m_max) && (
              <div className="flex-1 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-3 w-3 text-red-500 mr-1" />
                    <span>{Math.round(weather.temperature_2m_max)}°</span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-3 w-3 text-blue-500 mr-1" />
                    <span>{Math.round(weather.wind_speed_10m_max)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-500">{Math.round(weather.temperature_2m_min)}°</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">{getWindDirectionIcon(weather.wind_direction_10m_dominant)}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Gauge className="h-3 w-3 text-purple-500 mr-1" />
                  <span className="text-xs">{Math.round(weather.surface_pressure)}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <section className="py-20 bg-gradient-to-br from-ocean-50 to-sunset-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            📅 Calendrier & Réservations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Choisis ta date idéale avec la météo en temps réel ! 🌊⛵
          </p>
          <div className="flex items-center justify-center text-ocean-600 mb-8">
            <MapPin className="h-5 w-5 mr-2" />
            <span className="font-medium">Météo Agde - 7 jours</span>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Calendar Header */}
          <motion.div
            className="bg-white rounded-t-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Weather Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm">
                <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                <span>Température max/min</span>
              </div>
              <div className="flex items-center text-sm">
                <Wind className="h-4 w-4 text-blue-500 mr-2" />
                <span>Vent (km/h)</span>
              </div>
              <div className="flex items-center text-sm">
                <Gauge className="h-4 w-4 text-purple-500 mr-2" />
                <span>Pression (hPa)</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-lg mr-2">🧭</span>
                <span>Direction vent</span>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="h-10 flex items-center justify-center font-medium text-gray-700 bg-gray-100">
                  {day}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            className="bg-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            )}
          </motion.div>

          {/* Selected Date Info */}
          {selectedDate && (
            <motion.div
              className="bg-white rounded-b-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📅 {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {(() => {
                const weather = getWeatherForDate(selectedDate);
                return weather ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Thermometer className="h-5 w-5 text-red-500 mr-2" />
                        <span className="font-medium">Température</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(weather.temperature_2m_max)}° / {Math.round(weather.temperature_2m_min)}°
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Wind className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium">Vent</span>
                      </div>
                      <div className="flex items-center text-2xl font-bold text-gray-900">
                        <span className="mr-2">{Math.round(weather.wind_speed_10m_max)} km/h</span>
                        <span className="text-xl">{getWindDirectionIcon(weather.wind_direction_10m_dominant)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Gauge className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="font-medium">Pression</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(weather.surface_pressure)} hPa
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Données météo non disponibles pour cette date.</p>
                );
              })()}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-ocean-500 to-ocean-600 text-white py-3 px-6 rounded-lg font-medium hover:from-ocean-600 hover:to-ocean-700 transition-all duration-300 transform hover:scale-105">
                  🚤 Réserver cette date
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Calendar;
