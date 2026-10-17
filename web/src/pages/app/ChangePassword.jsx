import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useUI } from '../../components/UI';
import { PageHeader, PasswordInput, PrimaryButton, cardCls } from '../../components/Shell';

const Err = ({ children }) => (children ? <p className="-mt-3 mb-4 text-sm text-red-600">{children}</p> : null);
const Req = ({ ok, children }) => <li className={`flex items-center gap-2 text-sm ${ok ? 'text-emerald-700' : 'text-slate-400'}`}><Check className="w-4 h-4" />{children}</li>;

export default function ChangePassword() {
  const { user } = useAuth();
  const { toast, ask } = useUI();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (form.currentPassword === form.newPassword) e.newPassword = 'New password must be different from current password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.changePassword(user.id, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      await ask({ title: 'Success', message: 'Password changed successfully!', cancelLabel: null });
      navigate(-1);
    } catch (err) {
      let msg = err.message || 'Failed to change password. Please try again.';
      if (msg.includes('current password')) { setErrors((e) => ({ ...e, currentPassword: 'Current password is incorrect' })); msg = 'Current password is incorrect'; }
      else if (msg.includes('same as old')) { setErrors((e) => ({ ...e, newPassword: 'New password must be different from current password' })); msg = 'New password must be different from current password'; }
      toast({ type: 'error', title: 'Error', text: msg });
    } finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader back title="Change Password" />
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-6 max-w-4xl items-start">
        <div className={`${cardCls} p-7`}>
          <PasswordInput label="Current Password" placeholder="Enter your current password" value={form.currentPassword} onChange={set('currentPassword')} />
          <Err>{errors.currentPassword}</Err>
          <PasswordInput label="New Password" placeholder="Enter new password" value={form.newPassword} onChange={set('newPassword')} />
          <Err>{errors.newPassword}</Err>
          <PasswordInput label="Confirm New Password" placeholder="Confirm your new password" value={form.confirmPassword} onChange={set('confirmPassword')} />
          <Err>{errors.confirmPassword}</Err>
          <PrimaryButton type="submit" loading={loading} className="mt-2">Change Password</PrimaryButton>
        </div>
        <ul className={`${cardCls} p-7 space-y-2`}>
          <li className="font-semibold mb-1">Password Requirements</li>
          <Req ok={form.newPassword.length >= 6}>At least 6 characters</Req>
          <Req ok={!!form.newPassword && form.newPassword !== form.currentPassword}>Different from current password</Req>
          <Req ok={!!form.confirmPassword && form.newPassword === form.confirmPassword}>Passwords match</Req>
        </ul>
      </form>
    </>
  );
}
