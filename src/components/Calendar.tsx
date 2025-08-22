import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, 
  Thermometer, 
  Gauge, 
  MapPin, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { 
  fetchWeatherData, 
  WeatherData, 
  getWeatherIcon, 
  analyzeSailingConditions,
  getSpecialEvent
} from '../services/weatherService';
import CompassIcon from './CompassIcon';
import DailyValues from './DailyValues';
import { useTranslation } from 'react-i18next';

interface CalendarProps {}

const Calendar: React.FC<CalendarProps> = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'fr-FR';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Single source of truth for UI colors based on Beaufort level
  const beaufortColor = (b: number): { bg: string; text: string } => {
    if (b <= 1) return { bg: 'bg-blue-200', text: 'text-gray-800' };
    if (b <= 3) return { bg: 'bg-green-500', text: 'text-white' };
    if (b <= 5) return { bg: 'bg-orange-500', text: 'text-white' };
    if (b <= 7) return { bg: 'bg-red-600', text: 'text-white' };
    return { bg: 'bg-black', text: 'text-white' };
  };

  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      const data = await fetchWeatherData();
      setWeatherData(data);
      // Auto-select today so the detail view is shown consistently
      const today = new Date();
      setSelectedDate(today);
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
    // Use local date (Europe/Paris) to match Open-Meteo 'daily.time' values, avoid UTC shift
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const exact = weatherData.find(w => w.date === dateStr) || null;
    if (exact) return exact;
    // Fallback: if it's today and the API starts at tomorrow, use the first available forecast
    if (isToday(date) && weatherData.length > 0) return weatherData[0];
    return null;
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
                    <span>{weather.temperature_2m_max.toFixed(1)}°</span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-3 w-3 text-blue-500 mr-1" />
                    <span>{Math.round(weather.wind_speed_10m_max)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[10px] text-gray-600">
                    <span className="mr-1">Rafales</span>
                  </div>
                  <div className="flex items-center text-[10px] text-gray-800">
                    <Wind className="h-3 w-3 text-gray-700 mr-1" />
                    <span>{Math.round(weather.wind_gusts_10m_max)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-500">{weather.temperature_2m_min.toFixed(1)}°</span>
                  </div>
                  <div className="flex items-center">
                    <CompassIcon degrees={weather.wind_direction_10m_dominant} size={16} className="text-gray-800" />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Gauge className="h-3 w-3 text-purple-500 mr-1" />
                  <span className="text-xs">{Math.round(weather.surface_pressure)}</span>
                </div>
              </div>
            )}
            
            {/* Sailing Conditions Bar */}
            {weather && (() => {
              const conditions = analyzeSailingConditions(weather);
              const ui = beaufortColor(conditions.beaufortScale);
              const specialEvent = getSpecialEvent(weather.date);
              return (
                <div
                  className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 ${ui.bg} ${ui.text}`}
                  title={`${specialEvent || conditions.activity} • ${conditions.description} • Force ${conditions.beaufortScale} (${conditions.beaufortDescription})`}
                >
                  <div className="text-xs font-medium truncate">
                    {specialEvent || conditions.activity}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  // Localized weekday labels (Mon-Sun)
  const weekdayShorts = React.useMemo(() => {
    const baseMonday = new Date(2023, 0, 2); // 2023-01-02 is a Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseMonday);
      d.setDate(baseMonday.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [locale]);

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
            📅 {t('calendar.ui.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            {t('calendar.ui.subtitle')}
          </p>
          <div className="flex items-center justify-center text-ocean-600 mb-8">
            <MapPin className="h-5 w-5 mr-2" />
            <span className="font-medium">{t('calendar.ui.locationForecast')}</span>
          </div>
          
          {/* Current Day Weather */}
          {(() => {
            // Show current weather if available, otherwise show first day of forecast
            const today = new Date();
            let currentWeather = getWeatherForDate(today);
            
            // If today's weather is not available, use the first available day
            if (!currentWeather && weatherData.length > 0) {
              currentWeather = weatherData[0];
            }
            
            if (currentWeather) {
              const conditions = analyzeSailingConditions(currentWeather);
              const ui = beaufortColor(conditions.beaufortScale);
              const weatherDate = new Date(currentWeather.date);
              const isToday = weatherDate.toDateString() === today.toDateString();
              
              return (
                <motion.div
                  className={`max-w-2xl mx-auto p-6 rounded-xl ${ui.bg} ${ui.text} mb-8`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-2">
                    🌤️ {isToday ? t('calendar.currentWeather.todayTitle') : t('calendar.currentWeather.nextTitle')} - {weatherDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getWeatherIcon(currentWeather.weather_code)}</div>
                      <div className="text-sm opacity-90">{t('calendar.labels.conditions')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{currentWeather.temperature_2m_max.toFixed(1)}°</div>
                      <div className="text-sm opacity-90">{t('calendar.labels.temperature')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{Math.round(currentWeather.wind_speed_10m_max)}</div>
                      <div className="text-sm opacity-90">{t('calendar.labels.wind')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{Math.round(currentWeather.wind_gusts_10m_max)}</div>
                      <div className="text-sm opacity-90">{t('calendar.labels.gusts')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{conditions.beaufortScale}</div>
                      <div className="text-sm opacity-90">{t('calendar.labels.beaufort')}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1">{conditions.activity}</div>
                    <div className="text-sm opacity-90">{conditions.beaufortDescription}</div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })()}
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
                {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
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
                <span>{t('calendar.legend.weather.tempMaxMin')}</span>
              </div>
              <div className="flex items-center text-sm">
                <Wind className="h-4 w-4 text-blue-500 mr-2" />
                <span>{t('calendar.legend.weather.wind')}</span>
              </div>
              <div className="flex items-center text-sm">
                <Gauge className="h-4 w-4 text-purple-500 mr-2" />
                <span>{t('calendar.legend.weather.pressure')}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-lg mr-2">🧭</span>
                <span>{t('calendar.legend.weather.windDirection')}</span>
              </div>
              <div className="flex items-center text-sm col-span-2 md:col-span-1">
                <Wind className="h-4 w-4 text-gray-600 mr-2" />
                <span>{t('calendar.legend.weather.gusts')}</span>
              </div>
            </div>

            {/* Conditions Color Legend + Beaufort Scale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Color legend */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium mb-2">{t('calendar.legend.conditions.title')}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Excellent */}
                  <div className="relative group inline-block">
                    <span className="px-2 py-1 rounded bg-green-500 text-white inline-flex items-center gap-1">🌟 {t('calendar.level.excellent')}</span>
                    <div className="pointer-events-none absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-gray-900 text-[12px] shadow-xl rounded-md px-3 py-2 border w-[260px]">
                      <div className="font-semibold flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17l-5 3 1.9-5.9L4 9h6L12 3l2 6h6l-4.9 5.1L17 20z"/></svg>
                        <span>{t('calendar.level.excellent')}</span>
                      </div>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 8h10"/><path d="M4 16h12"/></svg><span>{t('calendar.legend.conditions.tooltip.excellent.wind')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2 4 4 12-12"/></svg><span>{t('calendar.legend.conditions.tooltip.excellent.sky')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 20V10a6 6 0 1112 0v10"/></svg><span>{t('calendar.legend.conditions.tooltip.excellent.temp')}</span></li>
                      </ul>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                    </div>
                  </div>

                  {/* Bon */}
                  <div className="relative group inline-block">
                    <span className="px-2 py-1 rounded bg-green-600 text-white inline-flex items-center gap-1">✅ {t('calendar.level.good')}</span>
                    <div className="pointer-events-none absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-gray-900 text-[12px] shadow-xl rounded-md px-3 py-2 border w-[260px]">
                      <div className="font-semibold flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                        <span>{t('calendar.level.good')}</span>
                      </div>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h14"/><path d="M4 8h10"/><path d="M4 16h12"/></svg><span>{t('calendar.legend.conditions.tooltip.good.wind')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/></svg><span>{t('calendar.legend.conditions.tooltip.good.sky')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 20V10a6 6 0 1112 0v10"/></svg><span>{t('calendar.legend.conditions.tooltip.good.temp')}</span></li>
                      </ul>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                    </div>
                  </div>

                  {/* Modéré */}
                  <div className="relative group inline-block">
                    <span className="px-2 py-1 rounded bg-orange-500 text-white inline-flex items-center gap-1">⚠️ {t('calendar.level.moderate')}</span>
                    <div className="pointer-events-none absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-gray-900 text-[12px] shadow-xl rounded-md px-3 py-2 border w-[280px]">
                      <div className="font-semibold flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        <span>{t('calendar.level.moderate')}</span>
                      </div>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/><path d="M4 8h10"/><path d="M4 16h12"/></svg><span>{t('calendar.legend.conditions.tooltip.moderate.wind')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h13"/><path d="M3 6h9"/><path d="M3 18h9"/></svg><span>{t('calendar.legend.conditions.tooltip.moderate.gusts')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 16.58A5 5 0 0018 9h-1.26A8 8 0 103 16.25"/></svg><span>{t('calendar.legend.conditions.tooltip.moderate.rain')}</span></li>
                      </ul>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                    </div>
                  </div>

                  {/* Difficile */}
                  <div className="relative group inline-block">
                    <span className="px-2 py-1 rounded bg-red-600 text-white inline-flex items-center gap-1">🔴 {t('calendar.level.difficult')}</span>
                    <div className="pointer-events-none absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-gray-900 text-[12px] shadow-xl rounded-md px-3 py-2 border w-[300px]">
                      <div className="font-semibold flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        <span>{t('calendar.level.difficult')}</span>
                      </div>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/><path d="M4 8h10"/><path d="M4 16h12"/></svg><span>{t('calendar.legend.conditions.tooltip.difficult.force')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h15"/><path d="M3 6h11"/><path d="M3 18h11"/><path d="M20 12l2 0"/></svg><span>{t('calendar.legend.conditions.tooltip.difficult.gusts')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 16s3-3 9-3 9 3 9 3"/><path d="M3 20s3-3 9-3 9 3 9 3"/><path d="M3 12s3-3 9-3 9 3 9 3"/></svg><span>{t('calendar.legend.conditions.tooltip.difficult.showers')}</span></li>
                      </ul>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                    </div>
                  </div>

                  {/* Dangereux */}
                  <div className="relative group inline-block">
                    <span className="px-2 py-1 rounded bg-black text-white inline-flex items-center gap-1">⚫ {t('calendar.level.dangerous')}</span>
                    <div className="pointer-events-none absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-gray-900 text-[12px] shadow-xl rounded-md px-3 py-2 border w-[300px]">
                      <div className="font-semibold flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a1 1 0 00.86 1.5h18.64a1 1 0 00.86-1.5L13.71 3.86a1 1 0 00-1.72 0z"/></svg>
                        <span>{t('calendar.level.dangerous')}</span>
                      </div>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16"/><path d="M4 8h10"/><path d="M4 16h12"/></svg><span>{t('calendar.legend.conditions.tooltip.dangerous.force')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h17"/><path d="M3 6h13"/><path d="M3 18h13"/><path d="M21 12l2 0"/></svg><span>{t('calendar.legend.conditions.tooltip.dangerous.gusts')}</span></li>
                        <li className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 4L4 13"/><path d="M7 15h2v2"/><path d="M15 7h2v2"/></svg><span>{t('calendar.legend.conditions.tooltip.dangerous.stayInPort')}</span></li>
                      </ul>
                      <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Beaufort scale visual */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                {(() => {
                  const refDate = selectedDate || new Date();
                  const w = getWeatherForDate(refDate) || (weatherData.length ? weatherData[0] : null);
                  if (!w) return null;
                  const cond = analyzeSailingConditions(w);
                  const currentBft = cond.beaufortScale;
                  const segments = Array.from({ length: 13 }, (_, i) => i);
                  const colorFor = (b: number) => {
                    if (b <= 1) return 'bg-blue-200 text-gray-800';
                    if (b <= 3) return 'bg-green-500 text-white';
                    if (b <= 5) return 'bg-orange-500 text-white';
                    if (b <= 7) return 'bg-red-600 text-white';
                    return 'bg-black text-white';
                  };
                  const colorName = (b: number) => {
                    if (b <= 1) return 'Bleu (calme)';
                    if (b <= 3) return 'Vert (favorable)';
                    if (b <= 5) return 'Orange (modéré)';
                    if (b <= 7) return 'Rouge (difficile)';
                    return 'Noir (très fort)';
                  };
                  // Local wind direction categories for Agde / Golfe du Lion
                  const directionCategory = (deg: number): { name: string; desc: string } => {
                    const d = ((Math.round(deg) % 360) + 360) % 360;
                    if (d >= 300 || d < 30) return { name: 'Tramontane (N–NW)', desc: 'Vent de terre, froid/sec, rafaleux' };
                    if (d >= 30 && d < 80) return { name: 'Nord-Est (Bise)', desc: 'Vent de terre, généralement sec' };
                    if (d >= 80 && d < 110) return { name: 'Levant (E)', desc: 'Marin, humide, houle d’est' };
                    if (d >= 110 && d < 160) return { name: 'Marin (SE)', desc: 'Vent marin, humide, houle, mer formée' };
                    if (d >= 160 && d < 200) return { name: 'Sirocco (S–SE)', desc: 'Chaud, parfois sableux' };
                    if (d >= 200 && d < 240) return { name: 'Libeccio (SW)', desc: 'Mer agitée, houle' };
                    if (d >= 240 && d < 300) return { name: 'Ponant / Cers (W)', desc: 'Souvent rafaleux, mer courte' };
                    return { name: 'Variable', desc: '' };
                  };
                  // Typical steady wind ranges per Beaufort (km/h)
                  const beaufortKmhRange = (b: number): { min?: number; max?: number; label: string } => {
                    switch (b) {
                      case 0: return { max: 0.9, label: '<1' };
                      case 1: return { min: 1, max: 5, label: '1–5' };
                      case 2: return { min: 6, max: 11, label: '6–11' };
                      case 3: return { min: 12, max: 19, label: '12–19' };
                      case 4: return { min: 20, max: 28, label: '20–28' };
                      case 5: return { min: 29, max: 38, label: '29–38' };
                      case 6: return { min: 39, max: 49, label: '39–49' };
                      case 7: return { min: 50, max: 61, label: '50–61' };
                      case 8: return { min: 62, max: 74, label: '62–74' };
                      case 9: return { min: 75, max: 88, label: '75–88' };
                      case 10: return { min: 89, max: 102, label: '89–102' };
                      case 11: return { min: 103, max: 117, label: '103–117' };
                      default: return { min: 118, label: '≥118' }; // 12
                    }
                  };
                  const gustText = (b: number) => {
                    const r = beaufortKmhRange(b);
                    // Approx gust guidance: up to ~40% above steady upper bound
                    if (r.max && r.max > 0) return `jusqu'à ~${Math.round(r.max * 1.4)} km/h`;
                    if (r.min && !r.max) return `≥~${Math.round(r.min * 1.4)} km/h`;
                    return '<~2 km/h';
                  };
                  // iconography now handled with inline SVG in tooltips
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium flex items-center gap-2">
                          <span>{t('calendar.beaufort.title')}</span>
                          {/* Info tooltip about rules */}
                          <div className="relative group inline-block">
                            <span className="cursor-help text-gray-500">ℹ️</span>
                            <div className="pointer-events-none absolute z-30 hidden group-hover:block top-full left-0 mt-2 bg-white text-gray-900 text-[12px] shadow-2xl rounded-lg px-4 py-3 border w-[420px]">
                              <div className="font-semibold mb-2">{t('calendar.beaufort.infoTitle')}</div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-gray-600">{t('calendar.beaufort.colorsTitle')}</div>
                                  <ul className="space-y-1 text-[12px]">
                                    <li className="flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#bfdbfe"/></svg><span>{t('calendar.beaufort.colors.range01')}</span></li>
                                    <li className="flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#22c55e"/></svg><span>{t('calendar.beaufort.colors.range23')}</span></li>
                                    <li className="flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#f97316"/></svg><span>{t('calendar.beaufort.colors.range45')}</span></li>
                                    <li className="flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#dc2626"/></svg><span>{t('calendar.beaufort.colors.range67')}</span></li>
                                    <li className="flex items-center gap-2"><svg className="w-3 h-3" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#000000"/></svg><span>{t('calendar.beaufort.colors.range8plus')}</span></li>
                                  </ul>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-gray-600">{t('calendar.beaufort.gustsTitle')}</div>
                                  <ul className="space-y-1 text-[12px]">
                                    <li className="flex items-center gap-2">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h13"/><path d="M3 6h9"/><path d="M3 18h9"/><path d="M19 12l2 0"/></svg>
                                      <span>{t('calendar.beaufort.gusts.moderate')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h15"/><path d="M3 6h11"/><path d="M3 18h11"/><path d="M20 12l2 0"/></svg>
                                      <span>{t('calendar.beaufort.gusts.difficult')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h17"/><path d="M3 6h13"/><path d="M3 18h13"/><path d="M21 12l2 0"/></svg>
                                      <span>{t('calendar.beaufort.gusts.dangerous')}</span>
                                    </li>
                                  </ul>
                                  <div className="mt-2 text-[11px] text-gray-600">{t('calendar.beaufort.colorNote')}</div>
                                </div>
                                <div className="col-span-2 border-t pt-2">
                                  <div className="text-xs font-semibold uppercase tracking-wide mb-1 text-gray-600">{t('calendar.beaufort.localDirectionTitle')}</div>
                                  <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 mt-0.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6l3 6-6 0 3-6z"/></svg>
                                    <div>
                                      <div className="font-medium">{directionCategory(w.wind_direction_10m_dominant).name} · {Math.round(w.wind_direction_10m_dominant)}°</div>
                                      <div className="text-[11px] text-gray-600">{directionCategory(w.wind_direction_10m_dominant).desc}</div>
                                    </div>
                                  </div>
                                  <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] text-gray-600">
                                    <div className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M5 9l7-7 7 7"/></svg> {t('calendar.beaufort.local.tramontane')}</div>
                                    <div className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V2"/><path d="M19 15l-7 7-7-7"/></svg> {t('calendar.beaufort.local.marin')}</div>
                                    <div className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M15 5l7 7-7 7"/></svg> {t('calendar.beaufort.local.ponant')}</div>
                                    <div className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H2"/><path d="M9 19L2 12l7-7"/></svg> {t('calendar.beaufort.local.levant')}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute left-4 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-b-white border-l-transparent border-r-transparent" />
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">{t('calendar.beaufort.current', { bft: currentBft, desc: cond.beaufortDescription })}</div>
                      </div>
                      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
                        {segments.map((b) => (
                          <div key={b} className="relative group">
                            <div
                              className={`h-6 flex items-center justify-center text-[10px] rounded ${colorFor(b)} ${b === currentBft ? 'ring-2 ring-ocean-500' : ''}`}
                              aria-label={t('calendar.beaufort.segmentAria', { b, name: t(`calendar.beaufort.names.${b}`), range: beaufortKmhRange(b).label, gust: gustText(b) })}
                            >
                              {b}
                            </div>
                            {/* Custom tooltip */}
                            <div className="pointer-events-none absolute z-20 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white text-gray-800 text-[11px] shadow-lg rounded px-2 py-2 border min-w-[200px]">
                              <div className="font-medium flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h10"/><path d="M3 18h14"/></svg>
                                <span>{t('calendar.beaufort.forceLabel', { b, name: t(`calendar.beaufort.names.${b}`) })}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-80 mt-0.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16"/><path d="M4 8h10"/><path d="M4 16h12"/></svg>
                                <span>{t('calendar.beaufort.meanWind', { range: beaufortKmhRange(b).label })}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-80 mt-0.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h15"/><path d="M3 6h11"/><path d="M3 18h11"/><path d="M20 12l2 0"/></svg>
                                <span>{t('calendar.beaufort.gustsLabel', { gust: gustText(b) })}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-80 mt-0.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6l3 6-6 0 3-6z"/></svg>
                                <span>{t('calendar.beaufort.directionLabel', { name: directionCategory(w.wind_direction_10m_dominant).name })}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${colorFor(b).split(' ')[0]}`} />
                                <span className="opacity-80">{t('calendar.beaufort.colorLabel', { color: colorName(b) })}</span>
                              </div>
                              <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdayShorts.map((day: string) => (
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
                📅 {selectedDate.toLocaleDateString(locale, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {(() => {
                const weather = getWeatherForDate(selectedDate);
                if (!weather) {
                  return <p className="text-gray-600">{t('calendar.noDataForDate')}</p>;
                }
                
                const conditions = analyzeSailingConditions(weather);
                const ui = beaufortColor(conditions.beaufortScale);
                const specialEvent = getSpecialEvent(weather.date);
                
                return (
                  <div className="space-y-6">
                    {/* Weather Data Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Thermometer className="h-5 w-5 text-red-500 mr-2" />
                          <span className="font-medium">{t('calendar.labels.temperature')}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {weather.temperature_2m_max.toFixed(1)}° / {weather.temperature_2m_min.toFixed(1)}°
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Wind className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">{t('calendar.labels.wind')}</span>
                        </div>
                        <div className="flex flex-col text-gray-900">
                          <div className="flex items-center text-2xl font-bold">
                            <span className="mr-2">{Math.round(weather.wind_speed_10m_max)} km/h</span>
                            <span className="ml-1">
                              <CompassIcon degrees={weather.wind_direction_10m_dominant} size={20} className="text-gray-900" />
                            </span>
                          </div>
                          <div className="text-sm opacity-80">{t('calendar.labels.gusts')}: {Math.round(weather.wind_gusts_10m_max)} km/h</div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Gauge className="h-5 w-5 text-purple-500 mr-2" />
                          <span className="font-medium">{t('calendar.legend.weather.pressure')}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round(weather.surface_pressure)} hPa
                        </div>
                      </div>
                    </div>
                    
                    {/* Sailing Conditions Recommendation */}
                    <div className={`p-6 rounded-xl ${ui.bg} ${ui.text}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xl font-bold">
                          {specialEvent || conditions.activity}
                        </h4>
                        <div className="text-sm opacity-90 font-medium">
                          {t('calendar.labels.conditions')}: {conditions.level === 'excellent' ? `🌟 ${t('calendar.level.excellent')}` : 
                                         conditions.level === 'good' ? `✅ ${t('calendar.level.good')}` :
                                         conditions.level === 'moderate' ? `⚠️ ${t('calendar.level.moderate')}` :
                                         conditions.level === 'difficult' ? `🔴 ${t('calendar.level.difficult')}` : `⚫ ${t('calendar.level.dangerous')}`}
                        </div>
                      </div>
                      <p className="text-lg font-medium">
                        {conditions.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm opacity-90">
                          <span className="font-medium">{t('calendar.summary.beaufort')}:</span> {conditions.beaufortScale} - {conditions.beaufortDescription}
                        </div>
                        <div className="text-sm opacity-90">
                          <span className="font-medium">{t('calendar.summary.windMax')}:</span> {Math.round(weather.wind_speed_10m_max)} km/h
                        </div>
                      </div>
                      {specialEvent && (
                        <p className="text-sm opacity-90 mt-2">
                          {conditions.description}
                        </p>
                      )}
                    </div>

                    {/* Detailed analysis (winds, sun, visibility, etc.) */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-900">🔎 {t('calendar.analysis.detailed')}</h4>
                        {weather.analysis && (
                          <div className="text-sm text-gray-600">{new Date(weather.date).toLocaleDateString(locale)}</div>
                        )}
                      </div>

                      {weather.analysis ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Vent */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center mb-2">
                              <Wind className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="font-medium text-gray-900">{t('calendar.analysis.wind.title')}</span>
                            </div>
                            <div className="space-y-1 text-gray-800">
                              <div className="text-lg font-semibold flex items-center gap-2">
                                <CompassIcon degrees={weather.analysis.windDirectionMean} size={20} className="text-gray-800" showCardinal />
                                <span>{weather.analysis.dominantWindName}</span>
                                <span className="ml-1 text-sm text-gray-600">({Math.round(weather.analysis.windDirectionMean)}°)</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{t('calendar.analysis.wind.variability')}:</span> ±{Math.round(weather.analysis.windVariability)}°
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{t('calendar.analysis.wind.mean')}:</span> {isFinite(weather.analysis.windMean) ? Math.round(weather.analysis.windMean) : '–'} km/h
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{t('calendar.analysis.wind.peak')}:</span> {isFinite(weather.analysis.windPeak) ? Math.round(weather.analysis.windPeak) : '–'} km/h
                                {weather.analysis.windPeakTime && (
                                  <span className="text-gray-600"> {t('common.at')} {new Date(weather.analysis.windPeakTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 mt-1">{weather.analysis.comments.wind}</div>
                            </div>
                          </div>

                          {/* Ensoleillement / Visibilité */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center mb-2">
                              <span className="text-yellow-500 text-xl mr-2">☀️</span>
                              <span className="font-medium text-gray-900">{t('calendar.analysis.lightVisibility.title')}</span>
                            </div>
                            <div className="space-y-1 text-gray-800">
                              <div className="text-sm"><span className="font-medium">{t('calendar.analysis.lightVisibility.sunHours')}:</span> {weather.analysis.sunnyHours}</div>
                              <div className="text-sm"><span className="font-medium">{t('calendar.analysis.lightVisibility.visibilityAvg')}:</span> {isFinite(weather.analysis.visibilityAvg) ? `${Math.round(weather.analysis.visibilityAvg / 1000)} km` : '–'}</div>
                              <div className="text-sm"><span className="font-medium">{t('calendar.analysis.lightVisibility.humidityAvg')}:</span> {isFinite(weather.analysis.humidityAvg) ? `${Math.round(weather.analysis.humidityAvg)}%` : '–'}</div>
                              <div className="text-sm text-gray-700 mt-1">{weather.analysis.comments.overview}</div>
                            </div>
                          </div>

                          {/* Température / Confort */}
                          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center mb-2">
                              <Thermometer className="h-5 w-5 text-red-500 mr-2" />
                              <span className="font-medium text-gray-900">{t('calendar.analysis.tempComfort.title')}</span>
                            </div>
                            <div className="space-y-1 text-gray-800">
                              <div className="text-lg font-semibold">{weather.temperature_2m_max.toFixed(1)}° / {weather.temperature_2m_min.toFixed(1)}°</div>
                              <div className="text-sm"><span className="font-medium">{t('calendar.analysis.tempComfort.thermalAmplitude')}:</span> {isFinite(weather.analysis.thermalAmplitude) ? `${weather.analysis.thermalAmplitude.toFixed(1)}°` : '–'}</div>
                              <div className="text-sm text-gray-700 mt-1">{weather.analysis.comments.comfort}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600">{t('calendar.analysis.generating')}</div>
                      )}

                      {/* Intra-day windows timeline */}
                      {weather.analysis?.windows && weather.analysis.windows.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center mb-3">
                            <span className="text-lg mr-2">📊</span>
                            <h5 className="font-semibold text-gray-900">{t('calendar.analysis.intradayEvolution')}</h5>
                          </div>
                          <div className="flex flex-col gap-2">
                            {weather.analysis.windows.map((w, idx) => {
                              const level = w.level;
                              const ui = level === 'excellent' ? { bg: 'bg-green-500 text-white' } :
                                         level === 'good' ? { bg: 'bg-green-600 text-white' } :
                                         level === 'moderate' ? { bg: 'bg-orange-500 text-white' } :
                                         level === 'difficult' ? { bg: 'bg-red-600 text-white' } :
                                         { bg: 'bg-black text-white' };
                              const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                              return (
                                <div key={idx} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${level === 'dangerous' ? 'border-black' : 'border-gray-200'} bg-white`}>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${ui.bg}`}>
                                      {level === 'excellent' ? t('calendar.level.excellent') :
                                       level === 'good' ? t('calendar.level.good') :
                                       level === 'moderate' ? t('calendar.level.moderate') :
                                       level === 'difficult' ? t('calendar.level.difficult') : t('calendar.level.dangerous')}
                                    </span>
                                    <span className="text-sm text-gray-800">{fmtTime(w.start)} – {fmtTime(w.end)}</span>
                                  </div>
                                  <div className="text-sm text-gray-700">{w.reason}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Valeurs horaires avec graphiques */}
                    <DailyValues date={selectedDate} />
                  </div>
                );
              })()}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-ocean-500 to-ocean-600 text-white py-3 px-6 rounded-lg font-medium hover:from-ocean-600 hover:to-ocean-700 transition-all duration-300 transform hover:scale-105">
                  🚤 {t('calendar.cta.bookDate')}
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
