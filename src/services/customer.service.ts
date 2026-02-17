import client from '../api/axiosClient';
import type { CustomerPublicProfile } from '../types/customer.types';

export const customerService = {
  getPublicProfile: async (idCustomer: number): Promise<CustomerPublicProfile> => {
    const response = await client.get(`/customers/${idCustomer}`);
    return response.data;
  },
};
