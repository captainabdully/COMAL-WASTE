import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Eye, Loader2, Plus, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { api, imageUrl } from '../../lib/api';
import { formatQuantity } from '../../lib/format';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader, PageLoader, StatusBadge, btnCls, cardCls, ghostBtnCls, inputCls } from '../../components/Shell';

const FILTERS = ['all', 'pending', 'assigned', 'completed', 'cancelled'];
const unit = (u) => (u === 'tonne' ? 'tonne' : 'kg');
const when = (d) => { const x = new Date(d); return Number.isNaN(x.getTime()) ? d : x.toLocaleString(); };

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.orders(user.id);
      setPickups([...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (e) { console.error('Error loading pickups:', e); }
  }, [user.id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const counts = useMemo(() => {
    const c = { all: pickups.length };
    FILTERS.slice(1).forEach((f) => { c[f] = pickups.filter((p) => p.status === f).length; });
    return c;
  }, [pickups]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pickups.filter((p) => (filter === 'all' || p.status === filter)
      && (!q || [p.order_id, p.category, p.location_name, p.phone_number].some((v) => String(v ?? '').toLowerCase().includes(q))));
  }, [pickups, filter, query]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <PageLoader />;

  const actions = (p) => (
    <div className="flex items-center justify-end gap-2">
      <button onClick={() => navigate(`/app/pickup/${p.id}`)} className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 text-sm font-semibold"><Eye className="w-4 h-4" />{t('viewDetails')}</button>
    </div>
  );

  const thumb = (p) => (p.image
    ? <img src={imageUrl(p.image)} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
    : <span className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Box className="w-5 h-5" /></span>);

  return (
    <>
      <PageHeader
        title={t('pickupRequests')}
        subtitle={`${t('welcomeBack')} ${user.name || user.email.split('@')[0]}`}
        actions={<>
          <Link to="/app/daily-prices" className={ghostBtnCls}><TrendingUp className="w-4 h-4" />{t('dailyPrices')}</Link>
          <Link to="/app/create-pickup" className={btnCls}><Plus className="w-4 h-4" />New pickup</Link>
        </>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {['pending', 'assigned', 'completed', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`${cardCls} !rounded-2xl p-5 text-left transition hover:shadow-md ${filter === s ? 'ring-2 ring-green-500' : ''}`}>
            <p className="text-3xl font-bold">{counts[s]}</p>
            <div className="mt-2"><StatusBadge status={s} label={t(s)} /></div>
          </button>
        ))}
      </div>

      <section className={`${cardCls} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {f === 'all' ? 'All' : t(f)} <span className="opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order, category, point…" className={`${inputCls} !py-2 pl-10 !rounded-full`} />
            </div>
            <button aria-label="Refresh" onClick={refresh} disabled={refreshing} className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100">{refreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}</button>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-400"><Box className="w-14 h-14" /><p className="mt-3">{t('noPickupRequests')}</p></div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                  <tr>{[t('order'), t('category'), t('quantity'), t('price'), t('dropPoint'), t('phone'), t('created'), 'Status', ''].map((h, i) => <th key={i} className="px-5 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 align-middle">
                      <td className="px-5 py-3"><div className="flex items-center gap-3">{thumb(p)}<span className="font-semibold">{p.order_id}</span></div></td>
                      <td className="px-5 py-3 capitalize">{p.category}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{formatQuantity(p.quantity)} {unit(p.quantity_unit)}</td>
                      <td className="px-5 py-3 whitespace-nowrap">Tsh {Number(p.price).toLocaleString()}</td>
                      <td className="px-5 py-3">{p.location_name}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{p.phone_number}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-slate-500">{when(p.created_at)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} label={t(p.status)} />
                        {p.status === 'cancelled' && p.rejection_comment && <p className="mt-1 text-xs text-red-700 max-w-[14rem]" title={p.rejection_comment}>{t('rejectionReason')}: {p.rejection_comment}</p>}
                      </td>
                      <td className="px-5 py-3">{actions(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tablet / phone cards */}
            <ul className="lg:hidden grid sm:grid-cols-2 gap-4 p-4">
              {shown.map((p) => (
                <li key={p.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    {thumb(p)}
                    <div className="flex-1 min-w-0"><p className="font-semibold truncate">{t('order')}: {p.order_id}</p><div className="mt-1"><StatusBadge status={p.status} label={t(p.status)} /></div></div>
                  </div>
                  <dl className="mt-3 space-y-1 text-sm">
                    {[[t('category'), p.category], [t('quantity'), `${formatQuantity(p.quantity)} ${unit(p.quantity_unit)}`], [t('price'), `Tsh ${Number(p.price).toLocaleString()}`], [t('dropPoint'), p.location_name], [t('phone'), p.phone_number], [t('created'), when(p.created_at)]].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="text-right break-words min-w-0">{v}</dd></div>
                    ))}
                  </dl>
                  {p.comment && <p className="mt-2 text-sm italic text-slate-500">{t('note')}: {p.comment}</p>}
                  {p.status === 'cancelled' && p.rejection_comment && <p className="mt-2 text-sm rounded-xl bg-red-50 text-red-800 p-3"><b>{t('rejectionReason')}:</b> {p.rejection_comment}</p>}
                  <div className="mt-3">{actions(p)}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

    </>
  );
}
