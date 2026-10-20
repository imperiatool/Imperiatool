import { useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import { useI18n } from '../../i18n/index.js';
import { changePassword, isEnvManaged, MIN_PASSWORD_LENGTH } from '../../lib/auth.js';

export default function SecurityTab() {
  const { t } = useI18n();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null); // { ok, text }

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < MIN_PASSWORD_LENGTH) return setMsg({ ok: false, text: t('auth.tooShort') });
    if (next !== confirm) return setMsg({ ok: false, text: t('auth.mismatch') });
    const ok = await changePassword(current, next);
    setMsg(ok ? { ok: true, text: t('sec.saved') } : { ok: false, text: t('auth.wrong') });
    if (ok) {
      setCurrent('');
      setNext('');
      setConfirm('');
    }
  };

  const input = 'mt-1 w-full rounded-xl border border-line bg-white px-3 py-2';
  return (
    <>
      <SectionTitle title={t('sec.title')}>{t('sec.desc')}</SectionTitle>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          {isEnvManaged() ? (
            <p className="text-sm">{t('sec.envManaged')}</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm font-medium">{t('sec.current')}
                <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={input} />
              </label>
              <label className="block text-sm font-medium">{t('sec.new')}
                <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={input} />
              </label>
              <label className="block text-sm font-medium">{t('auth.confirm')}
                <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
              </label>
              {msg && <p className={`text-sm ${msg.ok ? 'text-brand' : 'text-brand-dark'}`}>{msg.text}</p>}
              <Button type="submit" variant="primary" disabled={!current || !next}>{t('sec.save')}</Button>
            </form>
          )}
        </Card>
        <Card className="bg-amber/15">
          <p className="text-sm">{t('sec.note')}</p>
        </Card>
      </div>
    </>
  );
}
