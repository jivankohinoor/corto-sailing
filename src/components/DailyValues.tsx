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

  const { points, xTicks, yTicks, dims } = useMemo(() => {
    if (!data) return { points: '', xTicks: [] as {x:number,label:string}[], yTicks: [] as {y:number,label:string}[], dims: {W:540,H:220,M:{left:40,right:12,top:12,bottom:28}} };
    const W = 540, H = 220, M = { left: 40, right: 12, top: 12, bottom: 28 };
    const innerW = W - M.left - M.right;
    const innerH = H - M.top - M.bottom;
    const series = metric === 'visibility' ? (data.visibility.map(v => v / 1000)) : (data as any)[metric] as number[];
    const n = data.time.length;
    const minV = Math.min(...series);
    const maxV = Math.max(...series);
    const pad = (maxV - minV || 1) * 0.06;
    const rawMin = minV - pad;
    const rawMax = maxV + pad;
    // nice ticks
    const targetTicks = 5;
    const niceStep = (range: number, count: number) => {
      const raw = range / Math.max(1, count);
      const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
      const err = raw / pow10;
      const step = err >= 7.5 ? 10 * pow10 : err >= 3 ? 5 * pow10 : err >= 1.5 ? 2 * pow10 : pow10;
      return step;
    };
    const step = niceStep(rawMax - rawMin, targetTicks);
    const yMin = Math.floor(rawMin / step) * step;
    const yMax = Math.ceil(rawMax / step) * step;
    const yScale = (v: number) => H - M.bottom - ((v - yMin) / Math.max(1e-6, (yMax - yMin))) * innerH;
    const xScale = (i: number) => M.left + (i / Math.max(1, n - 1)) * innerW;
    const pts = series.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
    // y ticks
    const yTicksArr: { y: number; label: string }[] = [];
    const decimals = step < 1 ? 1 : 0;
    for (let v = yMin; v <= yMax + 1e-9; v += step) {
      yTicksArr.push({ y: yScale(v), label: v.toFixed(decimals) });
    }
    // x ticks every 3 hours
    const xTicksArr: { x: number; label: string }[] = [];
    for (let i = 0; i < n; i++) {
      const hh = Number(data.time[i].split('T')[1]?.slice(0,2) || '0');
      if (hh % 3 === 0) {
        xTicksArr.push({ x: xScale(i), label: `${String(hh).padStart(2,'0')}h` });
      }
    }
    return { points: pts, xTicks: xTicksArr, yTicks: yTicksArr, dims: { W, H, M } };
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
              <svg viewBox={`0 0 ${dims.W} ${dims.H}`} className="w-full h-56">
                {/* grid: horizontal */}
                {yTicks.map((t, idx) => (
                  <line key={`y${idx}`} x1={dims.M.left} x2={dims.W - dims.M.right} y1={t.y} y2={t.y} stroke="#eef2f7" />
                ))}
                {/* grid: vertical */}
                {xTicks.map((t, idx) => (
                  <line key={`x${idx}`} y1={dims.M.top} y2={dims.H - dims.M.bottom} x1={t.x} x2={t.x} stroke="#f1f5f9" />
                ))}
                {/* axes */}
                <line x1={dims.M.left} y1={dims.M.top} x2={dims.M.left} y2={dims.H - dims.M.bottom} stroke="#e5e7eb" />
                <line x1={dims.M.left} y1={dims.H - dims.M.bottom} x2={dims.W - dims.M.right} y2={dims.H - dims.M.bottom} stroke="#e5e7eb" />
                {/* y tick labels */}
                {yTicks.map((t, idx) => (
                  <text key={`yl${idx}`} x={dims.M.left - 6} y={t.y + 3} fontSize="10" fill="#6b7280" textAnchor="end">{t.label}</text>
                ))}
                {/* x tick labels */}
                {xTicks.map((t, idx) => (
                  <text key={`xl${idx}`} x={t.x} y={dims.H - 6} fontSize="10" fill="#6b7280" textAnchor="middle">{t.label}</text>
                ))}
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
