import { useContext } from 'react';
import { getI18n, getHasUsedI18nextProvider, I18nContext } from './context';

export function useSSR(initialI18nStore, initialLanguage, props = {}) {
  const { i18n: i18nFromProps } = props;
  const ReactI18nContext = useContext(I18nContext);
  const { i18n: i18nFromContext } = getHasUsedI18nextProvider() ? ReactI18nContext || {} : {};
  const i18n = i18nFromProps || i18nFromContext || getI18n();

  // opt out if is a cloned instance, eg. created by i18next-express-middleware on request
  // -> do not set initial stuff on server side
  if (i18n.options && i18n.options.isClone) return;

  // nextjs / SSR: getting data from next.js or other ssr stack
  if (initialI18nStore && !i18n.initializedStoreOnce) {
    i18n.services.resourceStore.data = initialI18nStore;

    // add namespaces to the config - so a languageChange call loads all namespaces needed
    i18n.options.ns = Object.values(initialI18nStore).reduce((mem, lngResources) => {
      Object.keys(lngResources).forEach(ns => {
        if (mem.indexOf(ns) < 0) mem.push(ns);
      });
      return mem;
    }, i18n.options.ns);

    i18n.initializedStoreOnce = true;
    i18n.isInitialized = true;
  }

  if (initialLanguage && !i18n.initializedLanguageOnce) {
    i18n.changeLanguage(initialLanguage);
    i18n.initializedLanguageOnce = true;
  }
}
