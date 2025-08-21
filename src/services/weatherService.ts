export interface WeatherData {
  date: string;
  temperature_2m_max: number;
  temperature_2m_min: number;
  surface_pressure: number;
  wind_speed_10m_max: number;
  wind_gusts_10m_max: number;
  wind_direction_10m_dominant: number;
  weather_code: number;
}

export interface SailingCondition {
  level: 'excellent' | 'good' | 'moderate' | 'difficult' | 'dangerous';
  color: string;
  bgColor: string;
  activity: string;
  description: string;
  beaufortScale: number;
  beaufortDescription: string;
}

export interface WeatherResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    weather_code: number[];
  };
}

// Agde coordinates: 43.3167, 3.4667
const AGDE_LAT = 43.3167;
const AGDE_LON = 3.4667;

export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${AGDE_LAT}&longitude=${AGDE_LON}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,weather_code&timezone=Europe%2FParis&forecast_days=14`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn(`Weather API responded with status: ${response.status}`);
      return getMockWeatherData();
    }
    
    const data: WeatherResponse = await response.json();
    
    if (!data.daily || !data.daily.time) {
      console.warn('Invalid weather data structure received');
      return getMockWeatherData();
    }
    
    return data.daily.time.map((date, index) => ({
      date,
      temperature_2m_max: data.daily.temperature_2m_max[index] ?? 20,
      temperature_2m_min: data.daily.temperature_2m_min[index] ?? 15,
      surface_pressure: 1013 + Math.random() * 20, // Open-Meteo daily doesn't provide pressure; keep synthetic for UI
      wind_speed_10m_max: data.daily.wind_speed_10m_max[index] ?? 10,
      wind_gusts_10m_max: data.daily.wind_gusts_10m_max[index] ?? ((data.daily.wind_speed_10m_max[index] ?? 10) * 1.3),
      wind_direction_10m_dominant: data.daily.wind_direction_10m_dominant[index] ?? 180,
      weather_code: data.daily.weather_code[index] ?? 1,
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
};

// Convert wind speed to Beaufort scale
const getBeaufortScale = (windSpeedKmh: number): { scale: number; description: string } => {
  if (windSpeedKmh < 1) return { scale: 0, description: 'Calme' };
  if (windSpeedKmh <= 5) return { scale: 1, description: 'Très légère brise' };
  if (windSpeedKmh <= 11) return { scale: 2, description: 'Légère brise' };
  if (windSpeedKmh <= 19) return { scale: 3, description: 'Petite brise' };
  if (windSpeedKmh <= 28) return { scale: 4, description: 'Jolie brise' };
  if (windSpeedKmh <= 38) return { scale: 5, description: 'Bonne brise' };
  if (windSpeedKmh <= 49) return { scale: 6, description: 'Vent frais' };
  if (windSpeedKmh <= 61) return { scale: 7, description: 'Grand frais' };
  if (windSpeedKmh <= 74) return { scale: 8, description: 'Coup de vent' };
  if (windSpeedKmh <= 88) return { scale: 9, description: 'Fort coup de vent' };
  if (windSpeedKmh <= 102) return { scale: 10, description: 'Tempête' };
  if (windSpeedKmh <= 117) return { scale: 11, description: 'Violente tempête' };
  return { scale: 12, description: 'Ouragan' };
};

// Analyze weather conditions for sailing activities
export const analyzeSailingConditions = (weather: WeatherData): SailingCondition => {
  const { wind_speed_10m_max, wind_gusts_10m_max, weather_code, temperature_2m_max } = weather;
  const beaufort = getBeaufortScale(wind_speed_10m_max);

  // Use an effective wind that accounts for gusts but weighs them less than steady wind
  const effectiveWind = Math.max(wind_speed_10m_max, Math.round(0.7 * wind_gusts_10m_max));

  // Color mapping aligned with the visual Beaufort scale
  const colorForBeaufort = (b: number): { bg: string; text: string } => {
    if (b <= 1) return { bg: 'bg-blue-200', text: 'text-gray-800' };   // Calme
    if (b <= 3) return { bg: 'bg-green-500', text: 'text-white' };     // 2-3
    if (b <= 5) return { bg: 'bg-orange-500', text: 'text-white' };    // 4-5
    if (b <= 7) return { bg: 'bg-red-600', text: 'text-white' };       // 6-7
    return { bg: 'bg-black', text: 'text-white' };                     // 8+
  };

  // Always derive UI color from Beaufort only to stay consistent with the scale
  const uiColor = colorForBeaufort(beaufort.scale);

  // Dangerous: only when clearly severe – by wind only (no weather code alone)
  if (
    wind_gusts_10m_max >= 80 ||
    beaufort.scale >= 9
  ) {
    return {
      level: 'dangerous',
      color: uiColor.text,
      bgColor: uiColor.bg,
      activity: '⚠️ Navigation interdite',
      description: `Conditions dangereuses (rafales ${Math.round(wind_gusts_10m_max)} km/h) - Restez au port (${beaufort.description})`,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Difficult: strong winds, showers/squalls, or thunderstorm codes
  if (
    beaufort.scale >= 6 ||
    wind_gusts_10m_max >= 70 ||
    [80, 81, 82, 85, 86, 95, 96, 99].includes(weather_code)
  ) {
    return {
      level: 'difficult',
      color: uiColor.text,
      bgColor: uiColor.bg,
      activity: '🌊 Navigation experte',
      description: `Réservé aux marins expérimentés (${beaufort.description})`,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Moderate: fresh breeze or notable rain; also moderate gusts escalation
  if (
    beaufort.scale >= 4 ||
    effectiveWind >= 20 ||
    wind_gusts_10m_max >= 50 ||
    [61, 63, 65, 71, 73, 75].includes(weather_code)
  ) {
    return {
      level: 'moderate',
      color: uiColor.text,
      bgColor: uiColor.bg,
      activity: '⛵ Navigation sportive',
      description: `Conditions dynamiques (${beaufort.description})`,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Excellent: pleasant breeze, fair weather
  if (
    effectiveWind >= 6 && effectiveWind <= 14 &&
    [0, 1, 2].includes(weather_code) &&
    temperature_2m_max > 20
  ) {
    return {
      level: 'excellent',
      color: uiColor.text,
      bgColor: uiColor.bg,
      activity: '🏖️ Journée parfaite',
      description: `Idéal pour navigation + pique-nique à bord (${beaufort.description})`,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Good: 10-20 km/h range or warm fair day
  if (
    (effectiveWind >= 10 && effectiveWind <= 20 && temperature_2m_max > 14) ||
    ([0, 1, 2].includes(weather_code) && temperature_2m_max >= 18)
  ) {
    return {
      level: 'good',
      color: uiColor.text,
      bgColor: uiColor.bg,
      activity: '🌅 Navigation plaisir',
      description: `Parfait pour une sortie voile détente (${beaufort.description})`,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Calm: very light winds
  if (effectiveWind < 6 || beaufort.scale <= 1) {
    return {
      level: 'moderate',
      color: uiColor.text,
      bgColor: uiColor.bg,
      activity: '🎣 Journée calme',
      description: `Parfait pour la pêche ou détente au mouillage (${beaufort.description})`,
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Default good conditions
  return {
    level: 'good',
    color: uiColor.text,
    bgColor: uiColor.bg,
    activity: '⛵ Navigation',
    description: `Conditions favorables pour naviguer (${beaufort.description})`,
    beaufortScale: beaufort.scale,
    beaufortDescription: beaufort.description
  };
};

// Check for special events/holidays
export const getSpecialEvent = (date: string): string | null => {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  // French holidays and special events
  const specialEvents: Record<string, string> = {
    '1-1': '🎊 Nouvel An',
    '2-14': '💕 Saint-Valentin',
    '5-1': '🌸 Fête du Travail',
    '5-8': '🇫🇷 Fête de la Victoire',
    '7-14': '🇫🇷 Fête Nationale',
    '8-15': '⛪ Assomption',
    '10-31': '🎃 Halloween',
    '11-1': '🕯️ Toussaint',
    '11-11': '🇫🇷 Armistice',
    '12-25': '🎄 Noël',
    '12-31': '🎆 Saint-Sylvestre'
  };
  
  // Summer sailing season
  if (month >= 6 && month <= 9) {
    if (month === 7 || month === 8) {
      return '☀️ Haute saison voile';
    }
    return '🌊 Saison voile';
  }
  
  return specialEvents[`${month}-${day}`] || null;
};

// Fallback mock data when API is unavailable
const getMockWeatherData = (): WeatherData[] => {
  const today = new Date();
  const mockData: WeatherData[] = [];
  
  // Generate realistic weather data for Agde in August
  const baseTemp = 25; // Base temperature for summer
  const basePressure = 1015; // Base atmospheric pressure
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Add some variation but keep it realistic
    const tempVariation = (Math.random() - 0.5) * 6; // ±3°C variation
    const maxTemp = Math.round(baseTemp + tempVariation + Math.random() * 5); // 25-33°C
    const minTemp = Math.round(maxTemp - 5 - Math.random() * 3); // 5-8°C lower than max
    
    const windSpeed = Math.round(5 + Math.random() * 20); // 5-25 km/h
    mockData.push({
      date: date.toISOString().split('T')[0],
      temperature_2m_max: maxTemp,
      temperature_2m_min: minTemp,
      surface_pressure: Math.round(basePressure + (Math.random() - 0.5) * 20),
      wind_speed_10m_max: windSpeed,
      wind_gusts_10m_max: Math.round(windSpeed * (1.2 + Math.random() * 0.3)), // 1.2-1.5x wind speed
      wind_direction_10m_dominant: Math.round(Math.random() * 360),
      weather_code: [0, 1, 2, 3, 45, 48, 51, 53, 55, 61, 63, 65][Math.floor(Math.random() * 12)]
    });
  }
  
  return mockData;
};

export const getWeatherIcon = (weatherCode: number): string => {
  // WMO Weather interpretation codes
  if (weatherCode === 0) return '☀️'; // Clear sky
  if (weatherCode <= 3) return '⛅'; // Partly cloudy
  if (weatherCode <= 48) return '🌫️'; // Fog
  if (weatherCode <= 57) return '🌦️'; // Drizzle
  if (weatherCode <= 67) return '🌧️'; // Rain
  if (weatherCode <= 77) return '❄️'; // Snow
  if (weatherCode <= 82) return '🌦️'; // Rain showers
  if (weatherCode <= 86) return '🌨️'; // Snow showers
  if (weatherCode <= 99) return '⛈️'; // Thunderstorm
  return '🌤️'; // Default
};

export const getWindDirectionIcon = (degrees: number): string => {
  if (degrees >= 337.5 || degrees < 22.5) return '⬆️'; // N
  if (degrees >= 22.5 && degrees < 67.5) return '↗️'; // NE
  if (degrees >= 67.5 && degrees < 112.5) return '➡️'; // E
  if (degrees >= 112.5 && degrees < 157.5) return '↘️'; // SE
  if (degrees >= 157.5 && degrees < 202.5) return '⬇️'; // S
  if (degrees >= 202.5 && degrees < 247.5) return '↙️'; // SW
  if (degrees >= 247.5 && degrees < 292.5) return '⬅️'; // W
  if (degrees >= 292.5 && degrees < 337.5) return '↖️'; // NW
  return '🧭'; // Default
};

export const getWindSpeedCategory = (speed: number): { icon: string; color: string } => {
  if (speed < 5) return { icon: '🍃', color: 'text-green-600' }; // Light breeze
  if (speed < 15) return { icon: '💨', color: 'text-blue-600' }; // Moderate breeze
  if (speed < 25) return { icon: '🌬️', color: 'text-yellow-600' }; // Strong breeze
  return { icon: '🌪️', color: 'text-red-600' }; // Very strong wind
};
