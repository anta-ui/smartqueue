// src/services/api/membersApi.js
const BASE_URL = '/api/organization';

export const membersApi = {
  getList: async (organizationId) => {
    const response = await fetch(`${BASE_URL}/${organizationId}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  add: async (organizationId, memberData) => {
    const response = await fetch(`${BASE_URL}/${organizationId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    if (!response.ok) throw new Error('Failed to add member');
    return response.json();
  },

  update: async (organizationId, memberId, data) => {
    const response = await fetch(`${BASE_URL}/${organizationId}/members/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update member');
    return response.json();
  },

  remove: async (organizationId, memberId) => {
    const response = await fetch(`${BASE_URL}/${organizationId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove member');
    return response.json();
  },
};
