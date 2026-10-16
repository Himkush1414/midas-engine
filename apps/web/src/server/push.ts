/** Expo push tokens look like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]. */
export const EXPO_TOKEN = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{10,}\]$/;

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound?: 'default' | null;
  channelId?: string;
}

/** Copy for the duel-result notification sent to the other player. */
export function duelResultMessage(input: {
  token: string;
  duelId: string;
  playerName: string;
  playerPoints: number;
  recipientPoints: number | null;
}): PushMessage {
  const { token, duelId, playerName, playerPoints, recipientPoints } = input;
  let body: string;
  if (recipientPoints === null) body = `${playerName} played your duel — your turn!`;
  else if (playerPoints > recipientPoints) body = `${playerName} beat your score: ${playerPoints.toLocaleString('en-US')} vs ${recipientPoints.toLocaleString('en-US')}. Rematch?`;
  else if (playerPoints < recipientPoints) body = `You won! ${playerName} scored ${playerPoints.toLocaleString('en-US')} against your ${recipientPoints.toLocaleString('en-US')}.`;
  else body = `It’s a draw with ${playerName} at ${playerPoints.toLocaleString('en-US')} points.`;
  return {
    to: token,
    title: 'Duel update',
    body,
    data: { url: `mindtier://duel/${duelId}` },
    sound: 'default',
    channelId: 'duels',
  };
}

/** Sends through Expo's push service. Failures are logged, never thrown: notifications are best-effort. */
export async function sendPush(messages: PushMessage[], fetchImpl: typeof fetch = fetch): Promise<number> {
  const valid = messages.filter((m) => EXPO_TOKEN.test(m.to));
  if (valid.length === 0) return 0;
  try {
    const res = await fetchImpl('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(valid),
    });
    if (!res.ok) console.warn('push send failed', res.status);
    return res.ok ? valid.length : 0;
  } catch (e) {
    console.warn('push send error', e);
    return 0;
  }
}
