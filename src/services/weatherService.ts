export interface WeatherData {
  date: string;
  temperature_2m_max: number;
  temperature_2m_min: number;
  surface_pressure: number;
  wind_speed_10m_max: number;
  wind_gusts_10m_max: number;
  wind_direction_10m_dominant: number;
  weather_code: number;
  analysis?: DayAnalysis;
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

export interface DayAnalysis {
  windDirectionMean: number;
  dominantWindName: string;
  windVariability: number;
  windMean: number;
  windPeak: number;
  windPeakTime?: string;
  sunnyHours: number;
  visibilityAvg: number;
  humidityAvg: number;
  thermalAmplitude: number;
  comments: {
    wind: string;
    comfort: string;
    overview: string;
  };
}

// Agde coordinates (as per provided query): 43.3108, 3.4758
const AGDE_LAT = 43.3108;
const AGDE_LON = 3.4758;

export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  try {
    // Use the REST equivalent of the provided Python query and include hourly weather_code
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${AGDE_LAT}&longitude=${AGDE_LON}` +
      `&hourly=temperature_2m,relative_humidity_2m,rain,showers,pressure_msl,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,pressure_msl,wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
      `&forecast_days=14&timezone=Europe%2FParis`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`Weather API responded with status: ${response.status}`);
      return getMockWeatherData();
    }

    const data = await response.json() as any;

    if (!data.hourly || !Array.isArray(data.hourly.time)) {
      console.warn('Invalid hourly weather data structure received');
      return getMockWeatherData();
    }

    // Aggregate hourly to daily summaries used by the Calendar
    type Acc = Record<string, {
      times: string[];
      temps: number[];
      winds: number[];
      gusts: number[];
      dirs: number[];
      pressures: number[];
      codes: number[];
      visibility: number[];
      humidity: number[];
      rain: number[];
      showers: number[];
    }>;

    const acc: Acc = {};
    const times: string[] = data.hourly.time;
    const temps: number[] = data.hourly.temperature_2m ?? [];
    const winds: number[] = data.hourly.wind_speed_10m ?? [];
    const gusts: number[] = data.hourly.wind_gusts_10m ?? [];
    const dirs: number[] = data.hourly.wind_direction_10m ?? [];
    const pressures: number[] = data.hourly.pressure_msl ?? [];
    const codes: number[] = data.hourly.weather_code ?? [];
    const visibility: number[] = data.hourly.visibility ?? [];
    const humidity: number[] = data.hourly.relative_humidity_2m ?? [];
    const rain: number[] = data.hourly.rain ?? [];
    const showers: number[] = data.hourly.showers ?? [];

    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      // Use local date string YYYY-MM-DD (API already returns local when timezone is set)
      const dateStr = t.split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { times: [], temps: [], winds: [], gusts: [], dirs: [], pressures: [], codes: [], visibility: [], humidity: [], rain: [], showers: [] };
      acc[dateStr].times.push(t);
      if (temps[i] != null) acc[dateStr].temps.push(temps[i]);
      if (winds[i] != null) acc[dateStr].winds.push(winds[i]);
      if (gusts[i] != null) acc[dateStr].gusts.push(gusts[i]);
      if (dirs[i] != null) acc[dateStr].dirs.push(dirs[i]);
      if (pressures[i] != null) acc[dateStr].pressures.push(pressures[i]);
      if (codes[i] != null) acc[dateStr].codes.push(codes[i]);
      if (visibility[i] != null) acc[dateStr].visibility.push(visibility[i]);
      if (humidity[i] != null) acc[dateStr].humidity.push(humidity[i]);
      if (rain[i] != null) acc[dateStr].rain.push(rain[i]);
      if (showers[i] != null) acc[dateStr].showers.push(showers[i]);
    }

    const toCircularMean = (angles: number[]): number => {
      if (!angles.length) return 180;
      const rad = angles.map(a => (a * Math.PI) / 180);
      const x = rad.reduce((s, a) => s + Math.cos(a), 0) / rad.length;
      const y = rad.reduce((s, a) => s + Math.sin(a), 0) / rad.length;
      const ang = Math.atan2(y, x) * 180 / Math.PI;
      return (ang + 360) % 360;
    };

    const pickDominant = (arr: number[]): number => {
      if (!arr.length) return 1;
      const counts = new Map<number, number>();
      for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
      let best = arr[0], bestC = 0;
      for (const [k, c] of counts) { if (c > bestC) { best = k; bestC = c; } }
      return best;
    };

    const stdDevAngles = (angles: number[], meanAngle: number): number => {
      if (angles.length <= 1) return 0;
      const meanRad = (meanAngle * Math.PI) / 180;
      const diffs = angles.map(a => {
        let d = ((a * Math.PI) / 180) - meanRad;
        // wrap to [-pi, pi]
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        return d;
      });
      const variance = diffs.reduce((s, d) => s + d * d, 0) / (diffs.length - 1);
      return Math.sqrt(variance) * 180 / Math.PI;
    };

    const windNameFromDir = (deg: number): string => {
      if (deg >= 290 || deg < 20) return 'Tramontane (NW-N)';
      if (deg >= 40 && deg < 140) return 'Marin (E-SE)';
      if (deg >= 200 && deg < 260) return 'Autan (S-SW)';
      // fallback by quadrant
      if (deg < 40) return 'Nord';
      if (deg < 90) return 'Nord-Est';
      if (deg < 140) return 'Est';
      if (deg < 200) return 'Sud-Est';
      if (deg < 260) return 'Sud';
      if (deg < 290) return 'Ouest';
      return 'Nord-Ouest';
    };

    const days = Object.keys(acc).sort();
    const daily: WeatherData[] = days.map(date => {
      const d = acc[date];
      const tmax = Math.max(...d.temps);
      const tmin = Math.min(...d.temps);
      const wmax = Math.max(...d.winds);
      const gmax = Math.max(...d.gusts);
      const dir = toCircularMean(d.dirs);
      const pressure = d.pressures.length ? d.pressures.reduce((a,b)=>a+b,0)/d.pressures.length : 1013;
      const code = pickDominant(d.codes);
      const wmean = d.winds.length ? d.winds.reduce((a,b)=>a+b,0)/d.winds.length : NaN;
      // peak gust time
      let peakTime: string | undefined;
      if (d.gusts.length && d.times.length) {
        const idx = d.gusts.indexOf(gmax);
        if (idx >= 0 && d.times[idx]) peakTime = d.times[idx];
      }
      const visibilityAvg = d.visibility.length ? d.visibility.reduce((a,b)=>a+b,0)/d.visibility.length : NaN;
      const humidityAvg = d.humidity.length ? d.humidity.reduce((a,b)=>a+b,0)/d.humidity.length : NaN;
      const sunnyHours = d.codes.reduce((cnt, c, i) => {
        const isSunny = c === 0 || c === 1 || c === 2; // clear/partly
        const noRain = (d.rain?.[i] ?? 0) === 0 && (d.showers?.[i] ?? 0) === 0;
        return cnt + (isSunny && noRain ? 1 : 0);
      }, 0);
      const variability = stdDevAngles(d.dirs, dir);
      const domName = windNameFromDir(dir);

      const thermalAmplitude = isFinite(tmax) && isFinite(tmin) ? (tmax - tmin) : NaN;

      const windComment = (() => {
        const b = getBeaufortScale(wmax);
        if (gmax >= 70) return `Rafales fortes jusqu'à ${Math.round(gmax)} km/h (≈ ${b.scale} Bft)`;
        if (wmax >= 30) return `Vent soutenu, pics à ${Math.round(wmax)} km/h (≈ ${b.scale} Bft)`;
        return `Vent modéré, moyen ~${Math.round(wmean || 0)} km/h (≈ ${b.scale} Bft)`;
      })();

      const comfortComment = (() => {
        const avgT = ((isFinite(tmax) ? tmax : 0) + (isFinite(tmin) ? tmin : 0)) / 2;
        const hum = humidityAvg;
        if (tmax >= 30 && (hum ?? 0) >= 60) return 'Chaleur lourde, hydratation conseillée';
        if (tmax >= 28 && (hum ?? 0) <= 40 && wmean >= 15) return 'Chaud mais ventilé, agréable en mer';
        if (avgT < 20) return 'Températures fraîches, prévoyez une couche coupe-vent';
        return 'Confort globalement bon';
      })();

      const overview = (() => {
        const visKm = isFinite(visibilityAvg) ? (visibilityAvg / 1000) : NaN;
        const sun = sunnyHours;
        if (sun >= 8 && (visKm >= 20 || isNaN(visKm))) return 'Belle journée lumineuse et dégagée';
        if (sun <= 2) return 'Ciel couvert à nuageux, ensoleillement limité';
        return 'Alternance d’éclaircies et de passages nuageux';
      })();
      return {
        date,
        temperature_2m_max: isFinite(tmax) ? tmax : 20,
        temperature_2m_min: isFinite(tmin) ? tmin : 15,
        surface_pressure: isFinite(pressure) ? pressure : 1013,
        wind_speed_10m_max: isFinite(wmax) ? wmax : 10,
        wind_gusts_10m_max: isFinite(gmax) ? gmax : (isFinite(wmax) ? wmax * 1.3 : 13),
        wind_direction_10m_dominant: isFinite(dir) ? dir : 180,
        weather_code: code ?? 1,
        analysis: {
          windDirectionMean: dir,
          dominantWindName: domName,
          windVariability: variability,
          windMean: isFinite(wmean) ? wmean : NaN,
          windPeak: isFinite(gmax) ? gmax : NaN,
          windPeakTime: peakTime,
          sunnyHours,
          visibilityAvg,
          humidityAvg,
          thermalAmplitude,
          comments: {
            wind: windComment,
            comfort: comfortComment,
            overview,
          }
        }
      };
    });

    // Keep only the next 14 days (already the case) and return
    return daily;
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

// Fetch hourly series for a specific local date (YYYY-MM-DD) for Agde
export const fetchHourlyForDate = async (localDate: string): Promise<{
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  wind_direction_10m: number[];
  relative_humidity_2m: number[];
  pressure_msl: number[];
  visibility: number[];
}> => {
  const params = new URLSearchParams({
    latitude: String(AGDE_LAT),
    longitude: String(AGDE_LON),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'rain',
      'showers',
      'pressure_msl',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'weather_code'
    ].join(','),
    timezone: 'Europe/Paris',
    start_date: localDate,
    end_date: localDate,
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Hourly API status ${res.status}`);
  const data = await res.json();
  const h = data.hourly || {};
  return {
    time: h.time ?? [],
    temperature_2m: h.temperature_2m ?? [],
    wind_speed_10m: h.wind_speed_10m ?? [],
    wind_gusts_10m: h.wind_gusts_10m ?? [],
    wind_direction_10m: h.wind_direction_10m ?? [],
    relative_humidity_2m: h.relative_humidity_2m ?? [],
    pressure_msl: h.pressure_msl ?? [],
    visibility: h.visibility ?? [],
  };
};
