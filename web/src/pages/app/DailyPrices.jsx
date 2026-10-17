import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useUI } from '../../components/UI';
import { PageHeader, PageLoader, btnCls, cardCls } from '../../components/Shell';

export const CATEGORY_COLORS = { heavy: '#EF4444', mixer: '#10B981', light: '#F59E0B', cast: '#3B82F6', default: '#6B7280' };

export default function DailyPrices() {
  const ui = useUI();
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pts, prices] = await Promise.all([api.droppingPoints(), api.todayPrices()]);
        const byPoint = {};
        prices.forEach((p) => {
          if (!p.dropping_point_id) return;
          const key = (p.category || '').toLowerCase().trim();
          (byPoint[p.dropping_point_id] ||= []).push({
            id: `${p.dropping_point_id}-${key}-${p.id}`, key,
            name: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Unknown',
            price: Number(p.price),
            color: CATEGORY_COLORS[key] || CATEGORY_COLORS.default,
          });
        });
        setPoints(pts.map((p) => ({ id: p.id, name: p.location_name || p.name || 'Unnamed Location', address: p.address || 'No Address', categories: byPoint[p.id] || [] })));
      } catch (e) {
        console.error(e);
        ui.toast({ type: 'error', title: 'Connection Error', text: 'Could not load data. Please check your network.' });
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const request = (point, category) => navigate('/app/create-pickup', { state: { dropping_point_id: String(point.id), category } });

  return (
    <>
      <PageHeader title="Daily prices" subtitle="Today’s price per kilo for every dropping point. Pick a price to start a pickup request."
        actions={<button onClick={() => navigate('/app/create-pickup')} className={btnCls}><Plus className="w-4 h-4" />New pickup</button>} />
      {loading ? <PageLoader /> : points.length === 0 ? (
        <p className="text-center text-slate-500 py-20">No dropping points available</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {points.map((p) => (
            <article key={p.id} className={`${cardCls} p-6 flex flex-col`}>
              <h2 className="text-xl font-bold">{p.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="w-4 h-4" />{p.address}</p>
              {p.categories.length === 0 ? <p className="mt-6 text-sm text-slate-400">No prices set today.</p> : (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {p.categories.map((c) => (
                    <button key={c.id} onClick={() => request(p, c.key)} title="Request a pickup at this price"
                      className="text-left rounded-2xl border border-slate-100 border-l-4 p-3.5 transition hover:shadow-md hover:-translate-y-0.5" style={{ borderLeftColor: c.color }}>
                      <p className="text-sm font-bold capitalize">{c.name}</p>
                      <p className="text-slate-600 font-semibold">Tsh {c.price.toLocaleString()}<span className="text-xs font-normal text-slate-400">/kg</span></p>
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
