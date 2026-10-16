import { useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import { listOrders, deleteOrder } from '../../services/orderService.js';
import { downloadBlob } from '../../lib/exportImage.js';
import { useI18n } from '../../i18n/index.js';

const LEGACY_STATUS = { bozza: 'draft', inviato: 'sent' };

export default function OrdersTab() {
  const { t, money, locale } = useI18n();
  const [orders, setOrders] = useState(listOrders);
  const refresh = () => setOrders(listOrders());

  return (
    <>
      <SectionTitle title={t('ord.title')}>{t('ord.desc')}</SectionTitle>
      {!orders.length && <Card><p className="text-sm text-muted">{t('ord.none')}</p></Card>}
      <div className="space-y-3">
        {orders.map((o) => {
          const status = LEGACY_STATUS[o.status] || o.status;
          const p = o.product || {};
          return (
            <Card key={o.id} className="flex flex-wrap items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#ecebe7]">
                {o.preview && <img src={o.preview} alt="" className="max-h-full max-w-full" />}
              </div>
              <div className="min-w-48 flex-1 text-sm">
                <p className="font-display text-lg font-bold">{o.id}</p>
                <p className="text-muted">
                  {new Date(o.createdAt).toLocaleString(locale)} · {o.customer?.name} · {o.customer?.email}
                </p>
                <p>
                  {p.quantity}× {p.size} · {p.material ? t(`order.materials.${p.material}.name`) : p.finish} ·{' '}
                  {p.attachment && t(`order.attachments.${p.attachment}`, {})} — <strong>{typeof p.total === 'number' ? money(p.total) : ''}</strong>
                </p>
              </div>
              <span className="rounded-full bg-amber/40 px-2.5 py-1 text-xs font-semibold">{t(`ord.status.${status}`)}</span>
              <Button size="sm" onClick={() => downloadBlob(new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' }), `${o.id}.json`)}>
                <Icon name="download" /> JSON
              </Button>
              <ConfirmButton size="sm" onConfirm={() => { deleteOrder(o.id); refresh(); }} aria-label={t('common.delete')}><Icon name="trash" /></ConfirmButton>
            </Card>
          );
        })}
      </div>
    </>
  );
}
