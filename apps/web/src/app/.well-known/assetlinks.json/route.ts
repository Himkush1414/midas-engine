import { SITE } from '@/lib/site';

/**
 * Digital Asset Links for Android App Links, so https://<site>/duel/<id> opens
 * the app directly. Set ANDROID_CERT_SHA256 to a comma-separated list of the
 * upload-key and Play app-signing certificate fingerprints (see HANDOFF).
 */
export function GET() {
  const fingerprints = (process.env.ANDROID_CERT_SHA256 ?? '')
    .split(',')
    .map((f) => f.trim().toUpperCase())
    .filter((f) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(f));
  const body = fingerprints.length
    ? [
        {
          relation: ['delegate_permission/common.handle_all_urls'],
          target: { namespace: 'android_app', package_name: SITE.androidPackage, sha256_cert_fingerprints: fingerprints },
        },
      ]
    : [];
  return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
