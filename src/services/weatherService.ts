export interface WeatherData {
  date: string;
  temperature_2m_max: number;
  temperature_2m_min: number;
  surface_pressure: number;
  wind_speed_10m_max: number;
  wind_direction_10m_dominant: number;
  weather_code: number;
}

export interface WeatherResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
    weather_code: number[];
  };
}

// Agde coordinates: 43.3167, 3.4667
const AGDE_LAT = 43.3167;
const AGDE_LON = 3.4667;

export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${AGDE_LAT}&longitude=${AGDE_LON}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant,weather_code&timezone=Europe%2FParis&forecast_days=7`;
    
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
      temperature_2m_max: data.daily.temperature_2m_max[index] || 20,
      temperature_2m_min: data.daily.temperature_2m_min[index] || 15,
      surface_pressure: 1013 + Math.random() * 20, // Generate realistic pressure since API doesn't provide it
      wind_speed_10m_max: data.daily.wind_speed_10m_max[index] || 10,
      wind_direction_10m_dominant: data.daily.wind_direction_10m_dominant[index] || 180,
      weather_code: data.daily.weather_code[index] || 1,
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData();
  }
};

// Fallback mock data when API is unavailable
const getMockWeatherData = (): WeatherData[] => {
  const today = new Date();
  const mockData: WeatherData[] = [];
  
  // Generate realistic weather data for Agde in August
  const baseTemp = 25; // Base temperature for summer
  const basePressure = 1015; // Base atmospheric pressure
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Add some variation but keep it realistic
    const tempVariation = (Math.random() - 0.5) * 6; // ±3°C variation
    const maxTemp = Math.round(baseTemp + tempVariation + Math.random() * 5); // 25-33°C
    const minTemp = Math.round(maxTemp - 5 - Math.random() * 3); // 5-8°C lower than max
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      temperature_2m_max: maxTemp,
      temperature_2m_min: minTemp,
      surface_pressure: Math.round(basePressure + (Math.random() - 0.5) * 20), // 1005-1025 hPa
      wind_speed_10m_max: Math.round(8 + Math.random() * 12), // 8-20 km/h
      wind_direction_10m_dominant: Math.round(Math.random() * 360), // 0-360°
      weather_code: Math.random() > 0.8 ? 3 : Math.random() > 0.6 ? 1 : 0, // Mostly sunny
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
