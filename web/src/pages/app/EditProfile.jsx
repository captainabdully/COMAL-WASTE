import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useUI } from '../../components/UI';
import { Field, PageHeader, PrimaryButton, cardCls, inputCls } from '../../components/Shell';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const { toast, ask } = useUI();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    api.getUser(user.id)
      .then((u) => u && setForm({ name: u.name || user.name, email: u.email || user.email, phone: u.phone_number || '' }))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast({ type: 'error', title: 'Error', text: 'Please fill in all fields' });
    if (!form.email.includes('@')) return toast({ type: 'error', title: 'Error', text: 'Please enter a valid email' });
    setLoading(true);
    try {
      await api.updateUser(user.id, form);
      updateProfile({ email: form.email.trim().toLowerCase(), name: form.name.trim() });
      await ask({ title: 'Success', message: 'Profile updated successfully!', cancelLabel: null });
      navigate(-1);
    } catch (err) { toast({ type: 'error', title: 'Error', text: err.message }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader back title="Edit Profile" />
      <form onSubmit={save} className={`${cardCls} p-7 max-w-2xl`}>
        <Field label="Full Name"><input className={inputCls} placeholder="Enter your full name" value={form.name} onChange={set('name')} /></Field>
        <Field label="Email Address"><input type="email" className={inputCls} placeholder="Enter your email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Phone Number"><input type="tel" className={inputCls} placeholder="Enter your phone number" value={form.phone} onChange={set('phone')} /></Field>
        <PrimaryButton type="submit" loading={loading} className="mt-2">Save Changes</PrimaryButton>
      </form>
    </>
  );
}
