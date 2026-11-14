import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Circle, RefreshCw, X } from 'lucide-react';
import { api, imageUrl } from '../../lib/api';
import { formatQuantity, formatTsh, removalNotice } from '../../lib/format';
import { useAuth } from '../../lib/AuthContext';
import { useUI } from '../../components/UI';
import { PageHeader, PageLoader, StatusBadge, cardCls, ghostBtnCls } from '../../components/Shell';

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-6 py-3 border-b border-slate-100 last:border-0"><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-right break-words min-w-0">{value}</dd></div>
);

const fmt = (d) => (d ? new Date(d).toLocaleString() : '');

function Timeline({ order }) {
  const cancelled = order.status === 'cancelled';
  const byVendor = cancelled && order.rejection_comment_by === order.vendor_id;
  const steps = [
    { label: 'Submitted', done: true, detail: fmt(order.created_at) },
    { label: 'Assigned', done: ['assigned', 'completed'].includes(order.status), detail: order.assigned_manager_name ? `Manager: ${order.assigned_manager_name}` : '' },
    cancelled
      ? { label: byVendor ? 'Cancelled by you' : 'Rejected', done: true, bad: true, detail: fmt(order.rejection_commented_at) }
      : { label: 'Completed', done: order.status === 'completed', detail: fmt(order.completed_at) },
  ];
  return (
    <ol className="mt-2 space-y-4">
      {steps.map((s) => (
        <li key={s.label} className="flex gap-3">
          <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s.bad ? 'bg-red-100 text-red-600' : s.done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-300'}`}>
            {s.bad ? <X className="w-4 h-4" /> : s.done ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
          </span>
          <div><p className={`font-semibold ${s.done ? '' : 'text-slate-400'}`}>{s.label}</p>{s.done && s.detail && <p className="text-sm text-slate-500">{s.detail}</p>}</div>
        </li>
      ))}
    </ol>
  );
}

export default function PickupDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast, ask } = useUI();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchOrder = async () => {
    try { setOrder(await api.order(id)); }
    catch (e) { toast({ type: 'error', title: 'Error', text: e.status === 0 ? 'Network error' : 'Failed to load order details' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrder(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const cancel = async () => {
    const ok = await ask({ title: 'Cancel this request?', message: 'The dropping point will no longer be expected to collect it.', confirmLabel: 'Yes, cancel', cancelLabel: 'Keep it', destructive: true });
    if (!ok) return;
    setBusy(true);
    try {
      await api.cancelOrder(order.id);
      toast({ type: 'success', title: 'Cancelled', text: 'Your pickup request was cancelled.' });
      await fetchOrder();
    } catch (e) { toast({ type: 'error', title: 'Error', text: e.message }); }
    finally { setBusy(false); }
  };

  const requestAgain = () => navigate('/app/create-pickup', { state: { dropping_point_id: order.dropping_point_id, category: order.category } });

  if (loading) return <PageLoader />;
  if (!order) {
    return <div className="text-center py-20"><p className="text-slate-600">Order not found</p><button onClick={() => navigate(-1)} className="mt-4 text-green-700 font-medium">Go Back</button></div>;
  }

  const cancelled = order.status === 'cancelled';
  const byVendor = cancelled && order.rejection_comment_by === order.vendor_id;
  const isOwner = order.vendor_id === user?.id;

  return (
    <>
      <PageHeader back title={`Order #${order.order_id}`} actions={<>
        <StatusBadge status={order.status} />
        {isOwner && order.status === 'pending' && <button onClick={cancel} disabled={busy} className="rounded-full border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 text-sm font-semibold disabled:opacity-50">Cancel request</button>}
        {cancelled && <button onClick={requestAgain} className={ghostBtnCls}><RefreshCw className="w-4 h-4" />Request again</button>}
      </>} />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6 self-start">
          <section className={`${cardCls} p-7`}>
            <h2 className="text-lg font-bold mb-2">Order Details</h2>
            <dl>
              <Row label="Category" value={<span className="capitalize">{order.category}</span>} />
              <Row label="Quantity" value={`${formatQuantity(order.quantity)} ${order.quantity_unit === 'tonne' ? 'tonne' : 'kg'}`} />
              <Row label="Estimated total" value={formatTsh(order.price)} />
              <Row label="Dropping Point" value={order.location_name} />
              <Row label="Vendor Phone" value={order.phone_number} />
              <Row label="Date" value={fmt(order.created_at)} />
            </dl>
            <p className="mt-3 text-xs text-slate-400">Estimate based on the price at the time of your request. The final amount is confirmed on collection.</p>
            {order.comment && <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500 mb-1">Comments</p><p className="italic">{order.comment}</p></div>}
            {cancelled && (
              <div className="mt-5 rounded-2xl bg-red-50 border-l-4 border-red-600 p-4">
                <p className="font-bold text-red-800 mb-1">{byVendor ? 'You cancelled this request' : 'Rejection reason'}</p>
                {!byVendor && order.rejection_comment && <p className="text-red-900">{order.rejection_comment}</p>}
                <p className="mt-2 text-sm text-red-700">{removalNotice(order)}</p>
              </div>
            )}
          </section>

          <section className={`${cardCls} p-7`}>
            <h2 className="text-lg font-bold">Progress</h2>
            <Timeline order={order} />
          </section>
        </div>

        <section className={`${cardCls} p-4 lg:col-span-2 self-start`}>
          <h2 className="text-lg font-bold m-3">Waste Photo</h2>
          {order.image
            ? <a href={imageUrl(order.image)} target="_blank" rel="noreferrer"><img src={imageUrl(order.image)} alt="Waste" className="w-full max-h-[28rem] object-cover rounded-3xl" /></a>
            : <p className="m-3 text-slate-500">No photo attached.</p>}
        </section>
      </div>
    </>
  );
}
