import { SITE } from '@/lib/site';

/**
 * Universal Links for iOS so duel links open the app. Requires APPLE_TEAM_ID
 * (10-character Apple Developer Team ID) — see docs/HANDOFF.md.
 */
export function GET() {
  const team = process.env.APPLE_TEAM_ID ?? '';
  const appIDs = /^[A-Z0-9]{10}$/.test(team) ? [`${team}.${SITE.androidPackage}`] : [];
  return Response.json(
    { applinks: { details: appIDs.length ? [{ appIDs, components: [{ '/': '/duel/*' }] }] : [] } },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
