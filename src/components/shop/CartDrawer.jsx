import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '../ui/Drawer.jsx';
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';
import CheckoutForm from '../order/CheckoutForm.jsx';
import { useCartStore } from '../../store/useCartStore.js';
import { submitOrder } from '../../services/orderService.js';
import { useI18n } from '../../i18n/index.js';

/** Cart panel: items, quantities, total and checkout (customer details). */
export default function CartDrawer() {
  const { t, price, fmt, currency } = useI18n();
  const { items, open, profile, show, setQty, remove, clear, setProfile } = useCartStore();
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'
  const close = () => {
    show(null);
    setStep('cart');
  };
  const line = (i) => Math.round(price(i.price) * i.qty * 100) / 100;
  const total = Math.round(items.reduce((s, i) => s + line(i), 0) * 100) / 100;

  const onSubmit = async ({ customer, notes }) => {
    const order = await submitOrder({
      customer,
      notes,
      currency,
      total,
      items: items.map((i) => ({ type: i.type, title: i.title, summary: i.summary, quantity: i.qty, unitPrice: price(i.price), config: i.config, preview: i.preview })),
      // first item, for the admin list
      product: { type: items[0]?.type === 'case' ? 'phone-case' : 'charm-3d', ...items[0]?.config, quantity: items.reduce((n, i) => n + i.qty, 0), total, currency },
      preview: items[0]?.preview || null,
    });
    if (!profile) setProfile(customer);
    clear();
    return order;
  };

  return (
    <Drawer open={open === 'cart'} onClose={close} title={t('cart.title')} testid="cart-drawer">
      {step === 'checkout' ? (
        <>
          <button type="button" onClick={() => setStep('cart')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-brand">
            <Icon name="arrowLeft" /> {t('cart.back')}
          </button>
          <CheckoutForm total={total} initial={profile} onSubmit={onSubmit} onDone={close} disabled={!items.length} />
        </>
      ) : items.length ? (
        <div className="flex flex-col gap-4">
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3 first:pt-0" data-testid="cart-item">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-studio">
                  {i.preview && <img src={i.preview} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand">{i.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{i.summary}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-full border border-line">
                      <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => setQty(i.id, i.qty - 1)} aria-label="−">
                        <Icon name="minus" className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                      <button type="button" className="grid h-8 w-8 place-items-center" onClick={() => setQty(i.id, i.qty + 1)} aria-label="+">
                        <Icon name="plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{fmt(line(i))}</span>
                  </div>
                </div>
                <button type="button" className="self-start rounded-full p-1.5 text-muted hover:text-brand" onClick={() => remove(i.id)} aria-label={t('common.delete')}>
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
            <span className="text-muted">{t('order.total')}</span>
            <span className="text-xl font-semibold" data-testid="cart-total">
              {fmt(total)}
            </span>
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center" onClick={() => setStep('checkout')} data-testid="checkout">
            {t('cart.checkout')}
          </Button>
        </div>
      ) : (
        <div className="py-10 text-center">
          <Icon name="bag" className="mx-auto h-10 w-10 text-ink/25" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted">{t('cart.empty')}</p>
          <Link to="/" onClick={close} className="mt-4 inline-block text-sm font-medium text-brand underline underline-offset-4">
            {t('home.shop')}
          </Link>
        </div>
      )}
    </Drawer>
  );
}
