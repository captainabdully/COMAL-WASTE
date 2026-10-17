import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useUI } from '../../components/UI';
import { useLanguage } from '../../i18n/LanguageContext';
import { AuthForm, ErrorBox, Field, PrimaryButton, inputCls } from '../../components/Shell';

export default function ForgotPassword() {
  const { toast } = useUI();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) return setError(t('phoneRequired'));
    setLoading(true);
    try {
      await api.forgotPassword(phone);
      toast({ title: t('phoneVerified'), text: t('phoneVerifiedDescription') });
      navigate('/create-new-password', { state: { phone_number: phone } });
    } catch (err) {
      const msg = err.message || t('phoneNotRegistered');
      toast({ type: 'error', title: t('error'), text: msg });
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm back title={t('verifyPhoneNumber')} subtitle={t('verifyPhoneDescription')} onSubmit={onSubmit}>
      <ErrorBox>{error}</ErrorBox>
      <Field label={t('phoneNumber')}><input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <PrimaryButton type="submit" loading={loading} className="w-full mt-2">{loading ? t('verifying') : t('verifyPhone')}</PrimaryButton>
    </AuthForm>
  );
}
