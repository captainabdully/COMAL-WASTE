import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, imageUrl } from '../../lib/api';
import { formatQuantity } from '../../lib/format';
import { useUI } from '../../components/UI';
import { PageHeader, PageLoader, StatusBadge, cardCls } from '../../components/Shell';

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-6 py-3 border-b border-slate-100 last:border-0"><dt className="text-slate-500">{label}</dt><dd className="font-semibold text-right break-words min-w-0">{value}</dd></div>
);

export default function PickupDetails() {
  const { id } = useParams();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try { setOrder(await api.order(id)); }
    catch (e) { toast({ type: 'error', title: 'Error', text: e.status === 0 ? 'Network error' : 'Failed to load order details' }); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrder(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  if (loading) return <PageLoader />;
  if (!order) {
    return <div className="text-center py-20"><p className="text-slate-600">Order not found</p><button onClick={() => navigate(-1)} className="mt-4 text-green-700 font-medium">Go Back</button></div>;
  }

  return (
    <>
      <PageHeader back title={`Order #${order.order_id}`} actions={<>
        <StatusBadge status={order.status} />
              </>} />

      <div className="grid lg:grid-cols-5 gap-6">
        <section className={`${cardCls} p-7 lg:col-span-3 self-start`}>
          <h2 className="text-lg font-bold mb-2">Order Details</h2>
          <dl>
            <Row label="Category" value={order.category} />
            <Row label="Quantity" value={`${formatQuantity(order.quantity)} ${order.quantity_unit === 'tonne' ? 'tonne' : 'kg'}`} />
            <Row label="Price" value={`${order.price} Tsh`} />
            <Row label="Dropping Point" value={order.location_name} />
            <Row label="Vendor Phone" value={order.phone_number} />
            <Row label="Date" value={new Date(order.created_at).toLocaleString()} />
          </dl>
          {order.comment && <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500 mb-1">Comments</p><p className="italic">{order.comment}</p></div>}
          {order.status === 'cancelled' && order.rejection_comment && (
            <div className="mt-5 rounded-2xl bg-red-50 border-l-4 border-red-600 p-4"><p className="font-bold text-red-800 mb-1">Rejection reason</p><p className="text-red-900">{order.rejection_comment}</p></div>
          )}
        </section>

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
