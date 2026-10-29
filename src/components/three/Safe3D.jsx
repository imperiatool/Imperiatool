import { Suspense } from 'react';
import ErrorBoundary from '../ui/ErrorBoundary.jsx';
import { useI18n } from '../../i18n/index.js';

/** A 3D preview that can fail on its own (no WebGL, lost GPU context, failed download) without blanking the page. */
export default function Safe3D({ children, fallback = null, className = '' }) {
  const { t } = useI18n();
  return (
    <ErrorBoundary
      fallback={(retry) => (
        <div className={`grid h-full w-full place-items-center p-6 text-center ${className}`} data-testid="viewer-error">
          <div>
            <p className="text-sm text-muted">{t('order.webglError')}</p>
            <button type="button" onClick={retry} className="mt-2 text-sm font-semibold text-brand underline underline-offset-4">
              {t('viewer.retry')}
            </button>
          </div>
        </div>
      )}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
