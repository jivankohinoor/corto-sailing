import i18n from '../i18n';

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

export type DayLevel = 'excellent' | 'good' | 'moderate' | 'difficult' | 'dangerous';

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

export interface DayWindow {
  start: string; // ISO time
  end: string;   // ISO time
  level: DayLevel;
  label: string; // localized (e.g., t('calendar.level.excellent'))
  reason: string;
}

export interface DayPeriodBest {
  part: string; // localized (e.g., t('calendar.period.morning'))
  level: DayLevel;
  reason: string;
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
  windows?: DayWindow[];
  bestPeriods?: DayPeriodBest[];
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
      const t = i18n.t.bind(i18n);
      if (deg >= 290 || deg < 20) return t('calendar.wind.directions.tramontane', { defaultValue: 'Tramontane (NW-N)' });
      if (deg >= 40 && deg < 140) return t('calendar.wind.directions.marin', { defaultValue: 'Marin (E-SE)' });
      if (deg >= 200 && deg < 260) return t('calendar.wind.directions.autan', { defaultValue: 'Autan (S-SW)' });
      // fallback by quadrant
      if (deg < 40) return t('calendar.wind.directions.nord', { defaultValue: 'Nord' });
      if (deg < 90) return t('calendar.wind.directions.nordEst', { defaultValue: 'Nord-Est' });
      if (deg < 140) return t('calendar.wind.directions.est', { defaultValue: 'Est' });
      if (deg < 200) return t('calendar.wind.directions.sudEst', { defaultValue: 'Sud-Est' });
      if (deg < 260) return t('calendar.wind.directions.sud', { defaultValue: 'Sud' });
      if (deg < 290) return t('calendar.wind.directions.ouest', { defaultValue: 'Ouest' });
      return t('calendar.wind.directions.nordOuest', { defaultValue: 'Nord-Ouest' });
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
        const t = i18n.t.bind(i18n);
        const b = getBeaufortScale(wmax);
        if (gmax >= 70) return t('calendar.analysis.comments.wind.highGusts', { gmax: Math.round(gmax), bft: b.scale, defaultValue: "Rafales fortes jusqu'à {{gmax}} km/h (≈ {{bft}} Bft)" });
        if (wmax >= 30) return t('calendar.analysis.comments.wind.strongPeaks', { wmax: Math.round(wmax), bft: b.scale, defaultValue: 'Vent soutenu, pics à {{wmax}} km/h (≈ {{bft}} Bft)' });
        return t('calendar.analysis.comments.wind.moderate', { wmean: Math.round(wmean || 0), bft: b.scale, defaultValue: 'Vent modéré, moyen ~{{wmean}} km/h (≈ {{bft}} Bft)' });
      })();

      const comfortComment = (() => {
        const t = i18n.t.bind(i18n);
        const avgT = ((isFinite(tmax) ? tmax : 0) + (isFinite(tmin) ? tmin : 0)) / 2;
        const hum = humidityAvg;
        if (tmax >= 30 && (hum ?? 0) >= 60) return t('calendar.analysis.comments.comfort.hotHumid', { defaultValue: 'Chaleur lourde, hydratation conseillée' });
        if (tmax >= 28 && (hum ?? 0) <= 40 && wmean >= 15) return t('calendar.analysis.comments.comfort.hotVentilated', { defaultValue: 'Chaud mais ventilé, agréable en mer' });
        if (avgT < 20) return t('calendar.analysis.comments.comfort.coolLayer', { defaultValue: 'Températures fraîches, prévoyez une couche coupe-vent' });
        return t('calendar.analysis.comments.comfort.overallGood', { defaultValue: 'Confort globalement bon' });
      })();

      const overview = (() => {
        const t = i18n.t.bind(i18n);
        const visKm = isFinite(visibilityAvg) ? (visibilityAvg / 1000) : NaN;
        const sun = sunnyHours;
        if (sun >= 8 && (visKm >= 20 || isNaN(visKm))) return t('calendar.analysis.comments.overview.sunnyClear', { defaultValue: 'Belle journée lumineuse et dégagée' });
        if (sun <= 2) return t('calendar.analysis.comments.overview.overcast', { defaultValue: 'Ciel couvert à nuageux, ensoleillement limité' });
        return t('calendar.analysis.comments.overview.mixed', { defaultValue: 'Alternance d’éclaircies et de passages nuageux' });
      })();

      // Intra-day analysis: hourly levels and optimal windows
      type Eval = { level: DayLevel; reason: string };
      const severityOrder: DayLevel[] = ['excellent', 'good', 'moderate', 'difficult', 'dangerous'];
      const levelLabel = (lv: DayLevel) => {
        const t = i18n.t.bind(i18n);
        return t(`calendar.level.${lv}`);
      };
      const evalHour = (i: number): Eval => {
        const w = d.winds[i] ?? 0;
        const g = d.gusts[i] ?? 0;
        const code = d.codes[i] ?? 1;
        const t = d.temps[i] ?? 20;
        const b = getBeaufortScale(w);
        const effectiveWind = Math.max(w, Math.round(0.7 * g));
        const tfn = i18n.t.bind(i18n);
        // Dangerous
        if (g >= 80 || b.scale >= 9) return { level: 'dangerous', reason: tfn('calendar.reasons.dangerousGusts', { g: Math.round(g), bdesc: b.description, defaultValue: 'Rafales {{g}} km/h ({{bdesc}})' }) };
        // Difficult
        if (b.scale >= 6 || g >= 70 || [80,81,82,85,86,95,96,99].includes(code)) return { level: 'difficult', reason: tfn('calendar.reasons.difficultWindShowers', { bdesc: b.description, defaultValue: 'Vent fort/averses ({{bdesc}})' }) };
        // Moderate
        if (b.scale >= 4 || effectiveWind >= 20 || g >= 50 || [61,63,65,71,73,75].includes(code)) return { level: 'moderate', reason: tfn('calendar.reasons.moderateDynamic', { bdesc: b.description, defaultValue: 'Conditions dynamiques ({{bdesc}})' }) };
        // Excellent
        if (effectiveWind >= 6 && effectiveWind <= 14 && [0,1,2].includes(code) && t > 20) return { level: 'excellent', reason: tfn('calendar.reasons.excellentBiseClear', { defaultValue: 'Bise agréable et ciel dégagé' }) };
        // Good
        if ((effectiveWind >= 10 && effectiveWind <= 20 && t > 14) || ([0,1,2].includes(code) && t >= 18)) return { level: 'good', reason: tfn('calendar.reasons.goodRegularFair', { defaultValue: 'Vent régulier et temps clément' }) };
        // Calm defaults to moderate leisure
        if (effectiveWind < 6 || b.scale <= 1) return { level: 'moderate', reason: tfn('calendar.reasons.calmVeryLowWind', { defaultValue: 'Très peu de vent' }) };
        return { level: 'good', reason: tfn('calendar.reasons.goodFavorable', { defaultValue: 'Conditions favorables' }) };
      };

      // Build contiguous windows (06:00–22:00 local)
      const windows: DayWindow[] = (() => {
        const startHour = 6, endHour = 22; // exclusive end
        const res: DayWindow[] = [];
        if (!d.times.length) return res;
        let currentStartIdx: number | null = null;
        let currentLevel: DayLevel | null = null;
        let currentReason = '';
        for (let i = 0; i < d.times.length; i++) {
          const h = Number(d.times[i].split('T')[1]?.slice(0,2) || '0');
          if (h < startHour || h >= endHour) continue;
          const ev = evalHour(i);
          if (currentLevel == null) {
            currentStartIdx = i;
            currentLevel = ev.level;
            currentReason = ev.reason;
          } else if (ev.level !== currentLevel) {
            // close previous
            const startISO = d.times[currentStartIdx!];
            const endISO = d.times[i];
            res.push({ start: startISO, end: endISO, level: currentLevel, label: levelLabel(currentLevel), reason: currentReason });
            // start new
            currentStartIdx = i;
            currentLevel = ev.level;
            currentReason = ev.reason;
          }
        }
        // close at endHour if open
        if (currentLevel != null && currentStartIdx != null) {
          // find last index within endHour
          let lastIdx = currentStartIdx;
          for (let j = currentStartIdx + 1; j < d.times.length; j++) {
            const hh = Number(d.times[j].split('T')[1]?.slice(0,2) || '0');
            if (hh >= endHour) break;
            lastIdx = j;
          }
          const endISO = d.times[lastIdx];
          res.push({ start: d.times[currentStartIdx], end: endISO, level: currentLevel, label: levelLabel(currentLevel), reason: currentReason });
        }
        return res;
      })();

      // Best per day part
      const bestPeriods: DayPeriodBest[] = (() => {
        const t = i18n.t.bind(i18n);
        const parts: Array<{ key: 'morning'|'afternoon'|'evening'; from: number; to: number; }> = [
          { key: 'morning', from: 6, to: 12 },
          { key: 'afternoon', from: 12, to: 18 },
          { key: 'evening', from: 18, to: 22 },
        ];
        const pick = (from: number, to: number): DayPeriodBest => {
          let best: Eval | null = null;
          for (let i = 0; i < d.times.length; i++) {
            const h = Number(d.times[i].split('T')[1]?.slice(0,2) || '0');
            if (h < from || h >= to) continue;
            const e = evalHour(i);
            if (!best) best = e;
            else if (severityOrder.indexOf(e.level) < severityOrder.indexOf(best.level)) best = e;
          }
          const level = best ? best.level : 'moderate';
          return { part: t('calendar.period.morning', { defaultValue: 'Matin' }), level, reason: best?.reason || t('common.noData', { defaultValue: 'Aucune donnée disponible.' }) } as DayPeriodBest;
        };
        return parts.map(p => {
          const res = pick(p.from, p.to);
          return { part: t(`calendar.period.${p.key}`), level: res.level, reason: res.reason };
        });
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
          windows,
          bestPeriods,
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
  const t = i18n.t.bind(i18n);
  if (windSpeedKmh < 1) return { scale: 0, description: t('calendar.beaufort.names.0', { defaultValue: 'Calme' }) };
  if (windSpeedKmh <= 5) return { scale: 1, description: t('calendar.beaufort.names.1', { defaultValue: 'Très légère brise' }) };
  if (windSpeedKmh <= 11) return { scale: 2, description: t('calendar.beaufort.names.2', { defaultValue: 'Légère brise' }) };
  if (windSpeedKmh <= 19) return { scale: 3, description: t('calendar.beaufort.names.3', { defaultValue: 'Petite brise' }) };
  if (windSpeedKmh <= 28) return { scale: 4, description: t('calendar.beaufort.names.4', { defaultValue: 'Jolie brise' }) };
  if (windSpeedKmh <= 38) return { scale: 5, description: t('calendar.beaufort.names.5', { defaultValue: 'Bonne brise' }) };
  if (windSpeedKmh <= 49) return { scale: 6, description: t('calendar.beaufort.names.6', { defaultValue: 'Vent frais' }) };
  if (windSpeedKmh <= 61) return { scale: 7, description: t('calendar.beaufort.names.7', { defaultValue: 'Grand frais' }) };
  if (windSpeedKmh <= 74) return { scale: 8, description: t('calendar.beaufort.names.8', { defaultValue: 'Coup de vent' }) };
  if (windSpeedKmh <= 88) return { scale: 9, description: t('calendar.beaufort.names.9', { defaultValue: 'Fort coup de vent' }) };
  if (windSpeedKmh <= 102) return { scale: 10, description: t('calendar.beaufort.names.10', { defaultValue: 'Tempête' }) };
  if (windSpeedKmh <= 117) return { scale: 11, description: t('calendar.beaufort.names.11', { defaultValue: 'Violente tempête' }) };
  return { scale: 12, description: t('calendar.beaufort.names.12', { defaultValue: 'Ouragan' }) };
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
      activity: i18n.t('calendar.activities.dangerous', { defaultValue: '⚠️ Navigation interdite' }),
      description: i18n.t('calendar.activities.desc.dangerous', { gmax: Math.round(wind_gusts_10m_max), bdesc: beaufort.description, defaultValue: 'Conditions dangereuses (rafales {{gmax}} km/h) - Restez au port ({{bdesc}})' }),
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
      activity: i18n.t('calendar.activities.difficult', { defaultValue: '🌊 Navigation experte' }),
      description: i18n.t('calendar.activities.desc.difficult', { bdesc: beaufort.description, defaultValue: 'Réservé aux marins expérimentés ({{bdesc}})' }),
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
      activity: i18n.t('calendar.activities.moderate', { defaultValue: '⛵ Navigation sportive' }),
      description: i18n.t('calendar.activities.desc.moderate', { bdesc: beaufort.description, defaultValue: 'Conditions dynamiques ({{bdesc}})' }),
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
      activity: i18n.t('calendar.activities.excellent', { defaultValue: '🏖️ Journée parfaite' }),
      description: i18n.t('calendar.activities.desc.excellent', { bdesc: beaufort.description, defaultValue: 'Idéal pour navigation + pique-nique à bord ({{bdesc}})' }),
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
      activity: i18n.t('calendar.activities.good', { defaultValue: '🌅 Navigation plaisir' }),
      description: i18n.t('calendar.activities.desc.good', { bdesc: beaufort.description, defaultValue: 'Parfait pour une sortie voile détente ({{bdesc}})' }),
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
      activity: i18n.t('calendar.activities.calm', { defaultValue: '🎣 Journée calme' }),
      description: i18n.t('calendar.activities.desc.calm', { bdesc: beaufort.description, defaultValue: 'Parfait pour la pêche ou détente au mouillage ({{bdesc}})' }),
      beaufortScale: beaufort.scale,
      beaufortDescription: beaufort.description
    };
  }

  // Default good conditions
  return {
    level: 'good',
    color: uiColor.text,
    bgColor: uiColor.bg,
    activity: i18n.t('calendar.activities.default', { defaultValue: '⛵ Navigation' }),
    description: i18n.t('calendar.activities.desc.default', { bdesc: beaufort.description, defaultValue: 'Conditions favorables pour naviguer ({{bdesc}})' }),
    beaufortScale: beaufort.scale,
    beaufortDescription: beaufort.description
  };
};

// Check for special events/holidays
export const getSpecialEvent = (date: string): string | null => {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  // Holidays and special events (localized)
  const t = i18n.t.bind(i18n);
  const specialEvents: Record<string, string> = {
    '1-1': t('calendar.specialEvents.holidays.newYear', { defaultValue: '🎊 Nouvel An' }),
    '2-14': t('calendar.specialEvents.holidays.valentines', { defaultValue: '💕 Saint-Valentin' }),
    '5-1': t('calendar.specialEvents.holidays.laborDay', { defaultValue: '🌸 Fête du Travail' }),
    '5-8': t('calendar.specialEvents.holidays.victoryDay', { defaultValue: '🇫🇷 Fête de la Victoire' }),
    '7-14': t('calendar.specialEvents.holidays.bastilleDay', { defaultValue: '🇫🇷 Fête Nationale' }),
    '8-15': t('calendar.specialEvents.holidays.assumption', { defaultValue: '⛪ Assomption' }),
    '10-31': t('calendar.specialEvents.holidays.halloween', { defaultValue: '🎃 Halloween' }),
    '11-1': t('calendar.specialEvents.holidays.allSaints', { defaultValue: '🕯️ Toussaint' }),
    '11-11': t('calendar.specialEvents.holidays.armistice', { defaultValue: '🇫🇷 Armistice' }),
    '12-25': t('calendar.specialEvents.holidays.christmas', { defaultValue: '🎄 Noël' }),
    '12-31': t('calendar.specialEvents.holidays.newYearsEve', { defaultValue: '🎆 Saint-Sylvestre' })
  };
  
  // Summer sailing season
  if (month >= 6 && month <= 9) {
    if (month === 7 || month === 8) {
      return t('calendar.specialEvents.season.high', { defaultValue: '☀️ Haute saison voile' });
    }
    return t('calendar.specialEvents.season.normal', { defaultValue: '🌊 Saison voile' });
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
