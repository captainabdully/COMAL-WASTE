import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useUI } from '../../components/UI';
import { useLanguage } from '../../i18n/LanguageContext';
import { AuthForm, ErrorBox, PasswordInput, PrimaryButton } from '../../components/Shell';

export default function CreateNewPassword() {
  const phone = useLocation().state?.phone_number;
  const { toast } = useUI();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!phone) {
    return (
      <div className="text-center">
        <AlertCircle className="w-14 h-14 text-red-600 mx-auto" />
        <h1 className="text-3xl font-bold mt-4">{t('invalidLink')}</h1>
        <p className="mt-2 mb-6 text-slate-600">{t('invalidLinkDescription')}</p>
        <PrimaryButton onClick={() => navigate('/forgot-password')}>{t('requestNewLink')}</PrimaryButton>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || !confirm) return setError('Both fields are required');
    if (password !== confirm) return setError('Passwords do not match *');
    if (password.length < 8) return setError('Password must be at least 8 characters long');
    setLoading(true);
    try {
      const res = await api.resetPassword(phone, password);
      toast({ title: t('success'), text: res?.message || 'Password reset successfully' });
      setTimeout(() => navigate('/sign-in', { replace: true }), 1500);
    } catch (err) {
      const msg = err.message || 'Failed to reset password';
      toast({ type: 'error', title: t('error'), text: msg });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm title={t('createNewPassword')} subtitle={`${t('newPasswordForPhone')} ${phone}`} onSubmit={onSubmit}>
      <ErrorBox>{error}</ErrorBox>
      <PasswordInput label={t('newPassword')} value={password} onChange={setPassword} autoComplete="new-password" />
      <PasswordInput label={t('retypePassword')} value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <PrimaryButton type="submit" loading={loading} className="w-full mt-2">{loading ? t('resetting') : t('resetPassword')}</PrimaryButton>
    </AuthForm>
  );
}
