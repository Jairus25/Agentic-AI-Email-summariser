import { EmailMessage } from '../types';

/**
 * Decodes base64url encoded string from Gmail API
 */
function decodeBase64Url(base64Url: string): string {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
}

/**
 * Extracts plain text or html body snippet from Gmail message payload parts
 */
function extractBodySnippet(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64Url(part.body.data);
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
      }
      if (part.parts) {
        const sub = extractBodySnippet(part);
        if (sub) return sub;
      }
    }
  }
  return '';
}

export async function fetchRecentEmails(accessToken: string, maxResults = 10): Promise<EmailMessage[]> {
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=category:primary OR in:inbox`;
  const listResp = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!listResp.ok) {
    if (listResp.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    const errText = await listResp.text();
    throw new Error(`Gmail API error (${listResp.status}): ${errText}`);
  }

  const listData = await listResp.json();
  const messagesList = listData.messages || [];

  if (messagesList.length === 0) {
    return [];
  }

  // Fetch full details for each message
  const emailPromises = messagesList.map(async (msgItem: { id: string; threadId: string }) => {
    try {
      const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgItem.id}?format=full`;
      const msgResp = await fetch(msgUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!msgResp.ok) return null;
      const data = await msgResp.json();

      const headers = data.payload?.headers || [];
      const getHeader = (name: string) => {
        const found = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return found ? found.value : '';
      };

      const subject = getHeader('subject') || '(No Subject)';
      const from = getHeader('from') || 'Unknown Sender';
      const dateHeader = getHeader('date') || '';
      
      let senderName = from;
      let senderEmail = from;
      const fromMatch = from.match(/^(.*?)\s*<(.+?)>$/);
      if (fromMatch) {
        senderName = fromMatch[1].replace(/^"|"$/g, '').trim() || fromMatch[2];
        senderEmail = fromMatch[2].trim();
      }

      const body = extractBodySnippet(data.payload);
      const isUnread = data.labelIds?.includes('UNREAD');

      const parsedEmail: EmailMessage = {
        id: data.id,
        threadId: data.threadId,
        sender: senderEmail,
        senderName: senderName,
        subject: subject,
        snippet: data.snippet || '',
        bodySnippet: body.slice(0, 2500) || data.snippet || '',
        date: dateHeader ? new Date(dateHeader).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Recently',
        timestamp: data.internalDate ? parseInt(data.internalDate, 10) : Date.now(),
        read: !isUnread,
      };

      return parsedEmail;
    } catch (e) {
      console.warn(`Failed to fetch message ${msgItem.id}`, e);
      return null;
    }
  });

  const results = await Promise.all(emailPromises);
  return results.filter((m): m is EmailMessage => m !== null);
}
