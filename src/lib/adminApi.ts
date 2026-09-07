const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export function getAdminKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sikh_id_admin_key');
}

export function setAdminKey(key: string) {
  localStorage.setItem('sikh_id_admin_key', key);
}

export function clearAdminKey() {
  localStorage.removeItem('sikh_id_admin_key');
}

async function request(path: string, options: RequestInit = {}) {
  const key = getAdminKey();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'X-Admin-Key': key } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 403) {
    clearAdminKey();
    throw new Error('Admin key rejected — please log in again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

// --- Overview ---
export const getStats = () => request('/api/v1/admin/stats');

// --- Users ---
export const listUsers = (params: Record<string, string | number> = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return request(`/api/v1/admin/users${qs ? `?${qs}` : ''}`);
};
export const deleteUser = (id: number) => request(`/api/v1/admin/users/${id}`, { method: 'DELETE' });

// --- Segments ---
export const listSegments = () => request('/api/v1/segments');
export const previewSegment = (filter: object) =>
  request('/api/v1/segments/preview', { method: 'POST', body: JSON.stringify({ filter }) });
export const createSegment = (payload: { name: string; description?: string; filter: object }) =>
  request('/api/v1/segments', { method: 'POST', body: JSON.stringify(payload) });
export const getSegmentMembers = (id: number) => request(`/api/v1/segments/${id}/members`);
export const deleteSegment = (id: number) => request(`/api/v1/segments/${id}`, { method: 'DELETE' });

// --- Campaigns ---
export const sendCampaign = (payload: {
  segmentId: number; subject: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string;
}) => request('/api/v1/campaigns/send', { method: 'POST', body: JSON.stringify(payload) });

// --- Events ---
export const listEventsAdmin = () => request('/api/v1/admin/events');
export const createEvent = (payload: object) =>
  request('/api/v1/admin/events', { method: 'POST', body: JSON.stringify(payload) });
export const updateEvent = (id: number, payload: object) =>
  request(`/api/v1/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteEvent = (id: number) => request(`/api/v1/admin/events/${id}`, { method: 'DELETE' });

// --- News / updates ---
export const listNewsAdmin = () => request('/api/v1/admin/news');
export const createNews = (payload: object) =>
  request('/api/v1/admin/news', { method: 'POST', body: JSON.stringify(payload) });
export const updateNews = (id: number, payload: object) =>
  request(`/api/v1/admin/news/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
export const deleteNews = (id: number) => request(`/api/v1/admin/news/${id}`, { method: 'DELETE' });

// --- Hukamnama ---
export const listHukamnamaAdmin = () => request('/api/v1/admin/hukamnama');
export const publishHukamnama = (payload: object) =>
  request('/api/v1/admin/hukamnama', { method: 'POST', body: JSON.stringify(payload) });
export const deleteHukamnama = (id: number) => request(`/api/v1/admin/hukamnama/${id}`, { method: 'DELETE' });

// --- Nominations ---
export const listNominations = (params: Record<string, string | number> = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return request(`/api/v1/admin/nominations${qs ? `?${qs}` : ''}`);
};
export const getNomination = (id: number) => request(`/api/v1/admin/nominations/${id}`);

// --- Nomination forms (per-site form builder) ---
export const listNominationForms = () => request('/api/v1/admin/nominations/forms');
export const getNominationForm = (siteDomain: string) =>
  request(`/api/v1/admin/nominations/forms/${encodeURIComponent(siteDomain)}`);
export const saveNominationForm = (
  siteDomain: string,
  payload: { title: string; fields: object[]; is_active: boolean }
) =>
  request(`/api/v1/admin/nominations/forms/${encodeURIComponent(siteDomain)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
export const deleteNominationForm = (siteDomain: string) =>
  request(`/api/v1/admin/nominations/forms/${encodeURIComponent(siteDomain)}`, { method: 'DELETE' });
