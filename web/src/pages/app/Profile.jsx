import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Lock, Mail, Pencil, Phone, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useUI } from '../../components/UI';
import { PageHeader, PageLoader, cardCls } from '../../components/Shell';

export default function Profile() {
  const { user } = useAuth();
  const ui = useUI();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const stats = { totalPickups: 0, completedPickups: 0, pendingPickups: 0, totalSpent: 'Tsh 0' };
      let u = {};
      try { u = (await api.getUser(user.id)) || {}; }
      catch { ui.toast({ type: 'error', title: 'Error', text: 'Failed to load profile data' }); }
      try {
        const orders = await api.orders(user.id);
        stats.totalPickups = orders.length;
        stats.completedPickups = orders.filter((o) => o.status === 'completed').length;
        stats.pendingPickups = orders.filter((o) => o.status === 'pending' || o.status === 'assigned').length;
        stats.totalSpent = `Tsh ${orders.reduce((s, o) => s + (parseFloat(o.price) || 0), 0).toLocaleString()}`;
      } catch (e) { console.log('Error fetching orders for stats:', e); }
      setData({
        email: u.email || user.email,
        name: u.name || user.email.split('@')[0] || 'User',
        phone: u.phone_number || '',
        userId: user.id,
        joinedDate: u.created_at ? new Date(u.created_at).toDateString() : '',
        ...stats,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return <PageLoader />;

  const info = [[Mail, 'Email Address', data.email], [Phone, 'Phone Number', data.phone], [User, 'User ID', data.userId], [Calendar, 'Member Since', data.joinedDate]];
  const stats = [[data.totalPickups, 'Total Pickups'], [data.completedPickups, 'Completed'], [data.pendingPickups, 'Pending'], [data.totalSpent, 'Total Spent']];
  const menu = [[Pencil, 'Edit Profile', '/app/edit-profile'], [Lock, 'Change Password', '/app/change-password']];

  return (
    <>
      <PageHeader title="My profile" />
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <aside className={`${cardCls} p-7 text-center`}>
          <div className="w-24 h-24 mx-auto rounded-full bg-green-100 text-green-800 text-4xl font-bold flex items-center justify-center">{data.name.charAt(0).toUpperCase()}</div>
          <h2 className="mt-4 text-xl font-bold break-words">{data.name}</h2>
          <p className="text-slate-500 text-sm break-words">{data.email}</p>
          <div className="mt-6 text-left divide-y divide-slate-100 border-t border-slate-100">
            {menu.map(([Icon, label, to]) => (
              <Link key={to} to={to} className="flex items-center gap-3 py-3.5 text-slate-700 hover:text-green-700"><Icon className="w-5 h-5" /><span className="flex-1 font-medium">{label}</span><ChevronRight className="w-4 h-4 text-slate-400" /></Link>
            ))}
            <Link to="/app" className="flex items-center gap-3 py-3.5 text-slate-700 hover:text-green-700"><span className="flex-1 font-medium pl-8">My Pickups</span><ChevronRight className="w-4 h-4 text-slate-400" /></Link>
          </div>
        </aside>

        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold mb-3">Pickup Statistics</h2>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map(([v, l]) => (
                <div key={l} className={`${cardCls} !rounded-2xl p-5`}><p className="text-2xl font-bold text-green-700 break-words">{v}</p><p className="text-sm text-slate-500 mt-1">{l}</p></div>
              ))}
            </div>
          </section>
          <section className={`${cardCls} p-7`}>
            <h2 className="text-lg font-bold mb-2">Account Information</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8">
              {info.map(([Icon, label, value]) => (
                <div key={label} className="flex items-start gap-3 py-4 border-b border-slate-100">
                  <Icon className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="font-medium break-words">{value || '—'}</dd></div>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
