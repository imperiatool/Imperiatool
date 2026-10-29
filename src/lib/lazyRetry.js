import { lazy } from 'react';

/**
 * React.lazy that survives a new deployment: when a page was opened before an
 * update, its old code chunk no longer exists on the server and the import
 * fails. Then the page is reloaded once (to get the new files) instead of
 * leaving an error; a second failure is passed on to the error boundary.
 */
export function lazyRetry(factory, key) {
  return lazy(() =>
    factory().then(
      (m) => {
        try {
          sessionStorage.removeItem(`imperia:reloaded:${key}`);
        } catch {
          /* storage blocked */
        }
        return m;
      },
      (err) => {
        let reloaded = true;
        try {
          reloaded = sessionStorage.getItem(`imperia:reloaded:${key}`) === '1';
          if (!reloaded) sessionStorage.setItem(`imperia:reloaded:${key}`, '1');
        } catch {
          /* storage blocked: do not loop */
        }
        if (!reloaded) {
          window.location.reload();
          return new Promise(() => {}); // wait for the reload
        }
        throw err;
      },
    ),
  );
}
