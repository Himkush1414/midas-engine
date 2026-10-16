import { json } from '@/server/http';

export function GET() {
  return json({ ok: true, service: 'mindtier-api', time: new Date().toISOString() });
}
