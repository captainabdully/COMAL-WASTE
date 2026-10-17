import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useUI } from '../../components/UI';
import { useLanguage } from '../../i18n/LanguageContext';
import { AuthForm, AuthLink, ErrorBox, Field, PasswordInput, PrimaryButton, inputCls } from '../../components/Shell';

export default function SignIn() {
  const { login } = useAuth();
  const { toast } = useUI();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/app';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fail = (msg) => { setError(msg); toast({ type: 'error', title: t('error'), text: msg }); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError(t('emailPasswordRequired'));
    setLoading(true);
    try {
      if (await login(email.trim(), password)) {
        toast({ title: t('success'), text: t('loginSuccess') });
        navigate(from, { replace: true });
      } else fail(t('invalidCredentials'));
    } catch (err) {
      fail(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm title={t('signIn')} subtitle="Skrepa Chap" onSubmit={onSubmit}>
      <ErrorBox>{error}</ErrorBox>
      <Field label={t('email')}><input type="email" autoComplete="email" placeholder={t('enterEmail')} value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
      <PasswordInput label={t('password')} value={password} onChange={setPassword} placeholder={t('enterPassword')} autoComplete="current-password" />
      <PrimaryButton type="submit" loading={loading} className="w-full mt-2">{t('signIn')}</PrimaryButton>
      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <AuthLink to="/forgot-password">{t('forgotPassword')}</AuthLink>
        <AuthLink to="/sign-up">{t('noAccount')}</AuthLink>
        <AuthLink to="/terms" className="text-xs !font-normal">{t('loginConsent')}</AuthLink>
      </div>
    </AuthForm>
  );
}
