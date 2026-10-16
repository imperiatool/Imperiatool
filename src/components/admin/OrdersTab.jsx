import { useState } from 'react';
import { SectionTitle, Card } from './AdminPage.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import ConfirmButton from '../ui/ConfirmButton.jsx';
import { listOrders, deleteOrder } from '../../services/orderService.js';
import { downloadBlob } from '../../lib/exportImage.js';

export default function OrdersTab() {
  const [orders, setOrders] = useState(listOrders);
  const refresh = () => setOrders(listOrders());

  return (
    <>
      <SectionTitle title="Richieste Charm 3D">
        Richieste salvate in questo browser. Il payload JSON è già strutturato per essere inviato a un e-commerce (vedi <code>src/services/orderService.js</code>).
      </SectionTitle>
      {!orders.length && <Card><p className="text-sm text-muted">Nessuna richiesta ancora.</p></Card>}
      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o.id} className="flex flex-wrap items-center gap-4">
            <div className="checker grid h-20 w-20 shrink-0 place-items-center rounded-xl">
              {o.preview && <img src={o.preview} alt="" className="max-h-full max-w-full" />}
            </div>
            <div className="min-w-48 flex-1 text-sm">
              <p className="font-display text-lg font-bold">{o.id}</p>
              <p className="text-muted">
                {new Date(o.createdAt).toLocaleString('it-IT')} · {o.customer?.name} · {o.customer?.email}
              </p>
              <p>
                {o.product?.quantity}× {o.product?.size} · {o.product?.finish} · {o.product?.attachment} —{' '}
                <strong>{o.product?.total?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</strong>
              </p>
            </div>
            <span className="rounded-full bg-amber/40 px-2.5 py-1 text-xs font-semibold">{o.status}</span>
            <Button size="sm" onClick={() => downloadBlob(new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' }), `${o.id}.json`)}>
              <Icon name="download" /> JSON
            </Button>
            <ConfirmButton size="sm" onConfirm={() => { deleteOrder(o.id); refresh(); }}><Icon name="trash" /></ConfirmButton>
          </Card>
        ))}
      </div>
    </>
  );
}
