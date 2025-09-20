class AdminHelpers {
  constructor(config) {
    this.config = config;
    this.adminTokens = new Map();
  }

  async loginAdmin(username = 'admin', password = 'admin123') {
    const axios = require('axios');
    
    try {
      const response = await axios.post('http://localhost:3006/admin/login', {
        username,
        password
      }, {
        headers: {
          'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production'
        }
      });
      
      if (response.data.success) {
        const token = response.data.data.token;
        this.adminTokens.set(username, token);
        return { success: true, token, data: response.data };
      }
      
      return { success: false, status: response.status, data: response.data };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: error.response?.data || { error: { message: error.message } }
      };
    }
  }

  getAdminAuthHeaders(username = 'admin') {
    const token = this.adminTokens.get(username);
    if (!token) {
      throw new Error(`No admin token found for ${username}. Call loginAdmin() first.`);
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production'
    };
  }

  async makeAdminRequest(method, url, data = null, username = 'admin') {
    const axios = require('axios');
    
    try {
      const headers = this.getAdminAuthHeaders(username);
      const config = { method, url, headers };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }
      
      const response = await axios(config);
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 500,
        data: error.response?.data || { error: { message: error.message } }
      };
    }
  }

  clearAdminTokens() {
    this.adminTokens.clear();
  }
}

module.exports = AdminHelpers;