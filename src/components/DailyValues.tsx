import React, { useEffect, useMemo, useState } from 'react';
import { fetchHourlyForDate } from '../services/weatherService';

export type MetricKey = 'temperature_2m' | 'wind_speed_10m' | 'wind_gusts_10m' | 'relative_humidity_2m' | 'pressure_msl' | 'visibility';

interface DailyValuesProps {
  date: Date;
}

interface HourlySeries {
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  wind_direction_10m: number[];
  relative_humidity_2m: number[];
  pressure_msl: number[];
  visibility: number[];
}

const metricLabels: Record<MetricKey, string> = {
  temperature_2m: 'Température (°C)',
  wind_speed_10m: 'Vent (km/h)',
  wind_gusts_10m: 'Rafales (km/h)',
  relative_humidity_2m: 'Humidité (%)',
  pressure_msl: 'Pression (hPa)',
  visibility: 'Visibilité (km)'
};

const DailyValues: React.FC<DailyValuesProps> = ({ date }) => {
  const [open, setOpen] = useState(true);
  const [metric, setMetric] = useState<MetricKey>('temperature_2m');
  const [data, setData] = useState<HourlySeries | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      try {
        const res = await fetchHourlyForDate(ds);
        setData(res);
      } catch (e) {
        console.warn('Failed to fetch hourly data', e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date]);

  const { points, min, max } = useMemo(() => {
    if (!data) return { points: '', min: 0, max: 1 };
    const series = metric === 'visibility' ? (data.visibility.map(v => v / 1000)) : (data as any)[metric] as number[];
    const xs = data.time.map((_, i) => i);
    const minV = Math.min(...series);
    const maxV = Math.max(...series);
    const pad = (maxV - minV || 1) * 0.1;
    const vmin = minV - pad;
    const vmax = maxV + pad;
    const width = 520;
    const height = 200;
    const pts = xs.map((x, i) => {
      const px = (x / Math.max(1, xs.length - 1)) * (width - 32) + 16;
      const py = height - 24 - ((series[i] - vmin) / (vmax - vmin)) * (height - 48);
      return `${px},${py}`;
    }).join(' ');
    return { points: pts, min: vmin, max: vmax };
  }, [data, metric]);

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-gray-900">📈 Valeurs horaires</h4>
        <button onClick={() => setOpen(o => !o)} className="text-sm text-ocean-600 hover:underline">
          {open ? 'Replier' : 'Déplier'}
        </button>
      </div>

      {open && (
        <div>
          {/* Metric selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(metricLabels) as MetricKey[]).map(k => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`px-3 py-1 rounded text-sm border ${metric === k ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
              >
                {metricLabels[k]}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {loading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500" />
              </div>
            ) : data ? (
              <svg viewBox="0 0 540 220" className="w-full h-56">
                {/* axes */}
                <line x1="16" y1="12" x2="16" y2="196" stroke="#e5e7eb" />
                <line x1="16" y1="196" x2="528" y2="196" stroke="#e5e7eb" />
                {/* min/max labels */}
                <text x="20" y="24" fontSize="10" fill="#6b7280">{max.toFixed(1)}</text>
                <text x="20" y="192" fontSize="10" fill="#6b7280">{min.toFixed(1)}</text>
                {/* line */}
                <polyline fill="none" stroke="#0ea5e9" strokeWidth="2" points={points} />
              </svg>
            ) : (
              <div className="text-gray-600">Aucune donnée disponible.</div>
            )}
            <div className="mt-2 text-xs text-gray-600">{metricLabels[metric]}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyValues;
