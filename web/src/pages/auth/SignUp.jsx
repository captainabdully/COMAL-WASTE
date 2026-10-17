import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUI } from '../../components/UI';
import { useLanguage } from '../../i18n/LanguageContext';
import { AuthForm, AuthLink, ErrorBox, Field, PasswordInput, PrimaryButton, inputCls } from '../../components/Shell';

export default function SignUp() {
  const { toast } = useUI();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (Object.values(form).some((v) => !v.trim())) return setError(t('allFieldsRequired'));
    setLoading(true);
    try {
      await api.register({ name: form.name, email: form.email, phone_number: form.phone, address: form.address, password: form.password });
      toast({ title: t('success'), text: t('accountCreated') });
      setTimeout(() => navigate('/sign-in', { replace: true }), 1500);
    } catch (err) {
      const msg = err.message || t('error');
      setError(msg);
      toast({ type: 'error', title: t('error'), text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm title={t('createAccount')} onSubmit={onSubmit}>
      <ErrorBox>{error}</ErrorBox>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label={t('name')}><input className={inputCls} autoComplete="name" value={form.name} onChange={set('name')} /></Field>
        <Field label={t('phoneNumber')}><input className={inputCls} type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} /></Field>
      </div>
      <Field label={t('email')}><input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={set('email')} /></Field>
      <Field label={t('address')}><input className={inputCls} autoComplete="street-address" value={form.address} onChange={set('address')} /></Field>
      <PasswordInput label={t('password')} value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} autoComplete="new-password" />
      <PrimaryButton type="submit" loading={loading} className="w-full mt-2">{t('signUp')}</PrimaryButton>
      <p className="mt-6 text-center text-sm"><AuthLink to="/sign-in">{t('alreadyHaveAccount')}</AuthLink></p>
    </AuthForm>
  );
}
