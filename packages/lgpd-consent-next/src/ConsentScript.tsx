import Script from 'next/script';

export type ConsentScriptProps = {
  /** GCM v2 default region (e.g. 'BR'). */
  region?: string;
  /** Allow analytics by default before user choice. Default: false (LGPD-safe). */
  defaultAnalytics?: boolean;
  /** Allow marketing by default before user choice. Default: false (LGPD-safe). */
  defaultMarketing?: boolean;
  /** CSP nonce to attach to the inline `<script>`. Required when CSP `script-src` uses nonces. */
  nonce?: string;
  /** Override the script id (useful when rendered multiple times in dev). */
  id?: string;
};

/**
 * Inline script that initializes `window.dataLayer`, defines `gtag`, and emits
 * Google Consent Mode v2 `default` state — all BEFORE any tracker loads.
 *
 * Drop in `<head>` of your root layout. Required by GCM v2 for compliance.
 *
 * @example
 * import { headers } from 'next/headers';
 *
 * export default async function Layout({ children }) {
 *   const nonce = (await headers()).get('x-nonce') ?? undefined;
 *   return (
 *     <html>
 *       <head><ConsentScript region="BR" nonce={nonce} /></head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 */
export function ConsentScript({
  region,
  defaultAnalytics = false,
  defaultMarketing = false,
  nonce,
  id = 'lgpd-consent-gcm-default',
}: ConsentScriptProps) {
  const analytics = defaultAnalytics ? 'granted' : 'denied';
  const marketing = defaultMarketing ? 'granted' : 'denied';
  const regionAttr = region ? `, region: ['${region}']` : '';

  const code = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent', 'default', {
  ad_storage: '${marketing}',
  ad_user_data: '${marketing}',
  ad_personalization: '${marketing}',
  analytics_storage: '${analytics}',
  functionality_storage: 'granted',
  personalization_storage: '${marketing}',
  security_storage: 'granted',
  wait_for_update: 500${regionAttr}
});`.trim();

  return (
    <Script id={id} strategy="beforeInteractive" nonce={nonce}>
      {code}
    </Script>
  );
}
