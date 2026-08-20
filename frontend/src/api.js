const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('medstore_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchCaptcha() {
  const res = await fetch(`${API_BASE}/auth/captcha`);
  if (!res.ok) throw new Error('Failed to fetch Captcha');
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json;
}

export async function signupUser(data) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Signup failed');
  return json;
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMedicines(category = '', search = '', symptom = '') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  if (symptom) params.append('symptom', symptom);

  const res = await fetch(`${API_BASE}/medicines?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch medicines');
  return res.json();
}

export async function addMedicine(data) {
  const res = await fetch(`${API_BASE}/medicines`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to add medicine');
  return json;
}

export async function updateMedicine(id, data) {
  const res = await fetch(`${API_BASE}/medicines/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update medicine');
  return json;
}

export async function deleteMedicine(id) {
  const res = await fetch(`${API_BASE}/medicines/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete medicine');
  return json;
}

export async function placeOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(orderData)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to place order');
  return json;
}

export async function fetchUserOrders() {
  const res = await fetch(`${API_BASE}/orders/user`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchAdminOrders() {
  const res = await fetch(`${API_BASE}/orders/admin`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch admin orders');
  return res.json();
}

export async function updateOrderStatus(id, status, paymentStatus) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status, paymentStatus })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update order status');
  return json;
}

export async function submitSpecialRequest(data) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to submit request');
  return json;
}

export async function fetchUserRequests() {
  const res = await fetch(`${API_BASE}/requests/user`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch user requests');
  return res.json();
}

export async function fetchAdminRequests() {
  const res = await fetch(`${API_BASE}/requests/admin`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch admin requests');
  return res.json();
}

export async function replyToRequest(id, adminReply, status) {
  const res = await fetch(`${API_BASE}/requests/${id}/reply`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ adminReply, status })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to reply to request');
  return json;
}
