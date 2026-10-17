import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useUI } from '../../components/UI';
import { Field, PageHeader, PrimaryButton, cardCls, ghostBtnCls, inputCls } from '../../components/Shell';

const CATEGORIES = ['heavy', 'light', 'cast', 'mixer'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CreatePickup() {
  const { user } = useAuth();
  const { toast, ask } = useUI();
  const navigate = useNavigate();
  const prefill = useLocation().state || {};
  const [points, setPoints] = useState([]);
  const [price, setPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [form, setForm] = useState({
    dropping_point_id: prefill.dropping_point_id || '', category: prefill.category || '',
    phone_number: '', quantity: '', quantity_unit: '', comment: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const err = (text) => toast({ type: 'error', title: 'Error', text });

  useEffect(() => {
    api.droppingPoints()
      .then((d) => setPoints(d.map((p) => ({ id: p.id, name: p.location_name || p.name, address: p.address || '' }))))
      .catch(() => err('Failed to load dropping points'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.dropping_point_id || !form.category) { setPrice(null); return; }
    let cancelled = false;
    setPriceLoading(true);
    api.todayPrices()
      .then((prices) => {
        if (cancelled) return;
        const m = prices.find((p) => String(p.dropping_point_id) === String(form.dropping_point_id) && String(p.category).toLowerCase() === form.category.toLowerCase());
        setPrice(m ? Number(m.price) : null);
      })
      .catch(() => !cancelled && setPrice(null))
      .finally(() => !cancelled && setPriceLoading(false));
    return () => { cancelled = true; };
  }, [form.dropping_point_id, form.category]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const accept = (f) => {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return err('Only JPEG, PNG, and WebP images are supported');
    if (f.size > 5 * 1024 * 1024) return err('Image must be 5 MB or smaller');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const pick = (e) => { const f = e.target.files?.[0]; e.target.value = ''; accept(f); };

  const qtyKg = Number(form.quantity || 0) * (form.quantity_unit === 'tonne' ? 1000 : 1);
  const total = price === null ? 0 : price * qtyKg;
  const point = points.find((p) => String(p.id) === String(form.dropping_point_id));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.dropping_point_id) return err('Please select a dropping point');
    if (!form.category) return err('Please select a category');
    if (price === null) return err('No current price is set for this dropping point and category');
    if (!form.phone_number) return err('Please enter a valid phone number');
    if (!form.quantity) return err('Please enter a valid quantity');
    if (!form.quantity_unit) return err('Please select kg or tonne before entering quantity');
    if (!file) return err('Please add a photo');

    setLoading(true);
    try {
      const filename = await api.upload(file);
      if (!filename) throw new Error('Failed to upload image');
      await api.createOrder({
        vendor_id: user.id,
        dropping_point_id: parseInt(form.dropping_point_id, 10),
        category: form.category,
        price: total,
        phone_number: form.phone_number,
        quantity: parseFloat(form.quantity),
        quantity_unit: form.quantity_unit,
        comment: form.comment || '',
        image: filename,
      });
      await ask({ title: 'Success', message: 'Pickup order created successfully!', cancelLabel: null });
      navigate('/app', { replace: true });
    } catch (e2) { err(e2.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader back title="Create Pickup Request" subtitle="Tell us what you’re selling and where — we’ll confirm the price and send a team." />
      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6 items-start">
        <div className={`${cardCls} p-7 lg:col-span-2`}>
          <div className="grid sm:grid-cols-2 gap-x-5">
            <Field label="Dropping Point *">
              <select className={inputCls} value={form.dropping_point_id} onChange={(e) => set('dropping_point_id', e.target.value)}>
                <option value="">Select dropping point</option>
                {points.map((p) => <option key={p.id} value={p.id}>{p.name}{p.address ? ` — ${p.address}` : ''}</option>)}
              </select>
            </Field>
            <Field label="Category *">
              <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
              </select>
            </Field>
            <Field label="Phone Number *"><input type="tel" className={inputCls} placeholder="Enter phone number" value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} /></Field>
            <Field label="Quantity Unit *">
              <div className="grid grid-cols-2 gap-2">
                {['kg', 'tonne'].map((u) => (
                  <button key={u} type="button" onClick={() => set('quantity_unit', u)}
                    className={`rounded-xl border px-4 py-3 font-bold transition ${form.quantity_unit === u ? 'bg-green-700 border-green-700 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{u === 'kg' ? 'KG' : 'TONNE'}</button>
                ))}
              </div>
            </Field>
          </div>
          <Field label={`Quantity${form.quantity_unit ? ` (${form.quantity_unit === 'kg' ? 'KG' : 'TONNE'})` : ''} *`}>
            <input type="number" inputMode="decimal" min="0" step="any" className={inputCls} disabled={!form.quantity_unit} value={form.quantity} onChange={(e) => set('quantity', e.target.value)}
              placeholder={form.quantity_unit ? `Enter quantity in ${form.quantity_unit === 'kg' ? 'KG' : 'tonnes'}` : 'Select KG or TONNE first'} />
          </Field>
          <Field label="Additional Comments"><textarea className={`${inputCls} min-h-[100px]`} placeholder="Any special instructions or comments" value={form.comment} onChange={(e) => set('comment', e.target.value)} /></Field>

          <p className="text-sm font-medium text-slate-700 mb-1.5">Waste Photo *</p>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Selected waste" className="w-full max-h-72 object-cover rounded-2xl" />
              <button type="button" onClick={() => { setFile(null); setPreview(''); }} className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-red-600 shadow"><Trash2 className="w-4 h-4" />Remove</button>
            </div>
          ) : (
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files?.[0]); }}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${drag ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <UploadCloud className="w-10 h-10 mx-auto text-slate-400" />
              <p className="mt-2 text-slate-600">Drag a photo here, or choose one</p>
              <p className="text-xs text-slate-400">JPEG, PNG or WebP · up to 5 MB</p>
              <div className="mt-4 flex justify-center gap-3">
                <button type="button" onClick={() => galleryRef.current.click()} className={ghostBtnCls}><ImageIcon className="w-4 h-4" />Gallery</button>
                <button type="button" onClick={() => cameraRef.current.click()} className={ghostBtnCls}><Camera className="w-4 h-4" />Camera</button>
              </div>
            </div>
          )}
          <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
        </div>

        <aside className={`${cardCls} p-7 lg:sticky lg:top-24`}>
          <h2 className="text-lg font-bold mb-4">Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Dropping point</dt><dd className="font-semibold text-right">{point?.name || '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Category</dt><dd className="font-semibold">{form.category ? cap(form.category) : '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Price today</dt>
              <dd className="font-semibold">{priceLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : price === null ? '—' : `Tsh ${price.toLocaleString()} / kg`}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Weight</dt><dd className="font-semibold">{qtyKg ? `${qtyKg.toLocaleString()} kg` : '—'}</dd></div>
          </dl>
          {form.dropping_point_id && form.category && !priceLoading && price === null && (
            <p className="mt-4 rounded-xl bg-red-50 text-red-700 text-sm p-3">No current price for this dropping point and category.</p>
          )}
          <div className="mt-5 pt-5 border-t border-slate-100 flex items-end justify-between">
            <span className="text-slate-500">Estimated total</span>
            <span className="text-2xl font-bold text-green-700">Tsh {total.toLocaleString()}</span>
          </div>
          <PrimaryButton type="submit" loading={loading} className="w-full mt-6">{loading ? 'Creating...' : 'Create Pickup Request'}</PrimaryButton>
        </aside>
      </form>
    </>
  );
}
