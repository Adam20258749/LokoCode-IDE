const API_URL = (import.meta as any).env?.VITE_API_URL || ''

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('lokocode_token')
  const base = API_URL || ''
  const res = await fetch(`${base}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  register: (email: string, username: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) }),
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  // Workspaces
  getWorkspaces: () => request('/workspaces'),
  createWorkspace: (name: string, type = 'personal') =>
    request('/workspaces', { method: 'POST', body: JSON.stringify({ name, type }) }),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id: string) => request(`/projects/${id}`),
  createProject: (name: string, language: string, workspaceId?: string) =>
    request('/projects', { method: 'POST', body: JSON.stringify({ name, language, workspaceId }) }),
  updateProject: (id: string, data: any) =>
    request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProject: (id: string) =>
    request(`/projects/${id}`, { method: 'DELETE' }),

  // Files
  getFiles: (projectId: string) => request(`/files/${projectId}`),
  createFile: (data: any) => request('/files', { method: 'POST', body: JSON.stringify(data) }),
  updateFile: (id: string, data: any) => request(`/files/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFile: (id: string) => request(`/files/${id}`, { method: 'DELETE' }),

  // AI
  getConversations: () => request('/ai'),
  createConversation: (title?: string) => request('/ai', { method: 'POST', body: JSON.stringify({ title }) }),
  getConversation: (id: string) => request(`/ai/${id}`),
  sendMessage: (id: string, role: string, content: string) =>
    request(`/ai/${id}/message`, { method: 'POST', body: JSON.stringify({ role, content }) }),
  deleteConversation: (id: string) => request(`/ai/${id}`, { method: 'DELETE' }),

  // Billing
  getPlans: () => request('/billing/plans'),
  getCurrentPlan: () => request('/billing/current'),
  upgradePlan: (planId: string) => request('/billing/upgrade', { method: 'POST', body: JSON.stringify({ planId }) }),
  getUsage: () => request('/billing/usage'),

  // VMs
  getVMs: () => request('/vms'),
  createVM: (data: any) => request('/vms', { method: 'POST', body: JSON.stringify(data) }),
  updateVM: (id: string, action: string) => request(`/vms/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  deleteVM: (id: string) => request(`/vms/${id}`, { method: 'DELETE' }),

  // API Keys
  getApiKeys: () => request('/apikeys'),
  addApiKey: (provider: string, apiKey: string) =>
    request('/apikeys', { method: 'POST', body: JSON.stringify({ provider, apiKey }) }),
  deleteApiKey: (id: string) => request(`/apikeys/${id}`, { method: 'DELETE' }),
}
