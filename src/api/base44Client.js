// Standalone drop-in API client replacing @base44/sdk

const TOKEN_KEY = 'kisan_mitra_token';

// Helper to make API requests with JWT authentication header
async function request(url, options = {}) {
  const headers = { ...options.headers };
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, { ...options, headers });
  
  if (!res.ok) {
    let errorMessage = 'An error occurred';
    try {
      const data = await res.json();
      errorMessage = data.error || errorMessage;
    } catch (_) {}
    
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  try {
    return await res.json();
  } catch (_) {
    return null;
  }
}

export const base44 = {
  auth: {
    me: () => request('/api/auth/me'),
    
    loginViaEmailPassword: async (email, password) => {
      const result = await request('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      if (result && result.access_token) {
        localStorage.setItem(TOKEN_KEY, result.access_token);
      }
      return result?.user;
    },

    register: (data) => request('/api/auth/register', {
      method: 'POST',
      body: data
    }),

    verifyOtp: async (data) => {
      const result = await request('/api/auth/verify-otp', {
        method: 'POST',
        body: data
      });
      if (result && result.access_token) {
        localStorage.setItem(TOKEN_KEY, result.access_token);
      }
      return result;
    },

    resendOtp: (email) => request('/api/auth/resend-otp', {
      method: 'POST',
      body: { email }
    }),

    resetPasswordRequest: (email) => request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email }
    }),

    resetPassword: (data) => request('/api/auth/reset-password', {
      method: 'POST',
      body: data
    }),

    updateMe: (data) => request('/api/auth/me', {
      method: 'PUT',
      body: data
    }),

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      return Promise.resolve();
    },

    // Check helper for frontend context check
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token)
  },

  entities: new Proxy({}, {
    get(target, entityName) {
      return {
        list: () => request(`/api/entities/${entityName}`),
        filter: (filters = {}, sort, limit) => {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(filters)) {
            if (v !== undefined && v !== null) {
              params.append(k, v);
            }
          }
          if (sort) params.set('_sort', sort);
          if (limit) params.set('_limit', limit);
          return request(`/api/entities/${entityName}?${params.toString()}`);
        },
        create: (data) => request(`/api/entities/${entityName}`, {
          method: 'POST',
          body: data
        }),
        update: (id, data) => request(`/api/entities/${entityName}/${id}`, {
          method: 'PUT',
          body: data
        }),
        delete: (id) => request(`/api/entities/${entityName}/${id}`, {
          method: 'DELETE'
        }),
        deleteMany: (filters = {}) => request(`/api/entities/${entityName}/delete-many`, {
          method: 'POST',
          body: filters
        })
      };
    }
  }),

  functions: {
    invoke: async (name, body) => {
      const res = await request(`/api/functions/${name}`, {
        method: 'POST',
        body
      });
      return { data: res };
    }
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return request('/api/upload', {
          method: 'POST',
          body: formData
        });
      }
    }
  }
};
