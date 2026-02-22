import * as dataService from '@/src/lib/sqlite/dataService';

export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  manager_id?: number;
  role_id?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  manager_id?: number;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  password?: string; // Optional - if not provided, existing password is kept
}

export interface UsersListResponse {
  users: User[];
}

export const usersApi = {
  list: async (): Promise<User[]> => {
    try {
      const users = await dataService.getAllUsers();
      return users as User[];
    } catch (err: any) {
      if (__DEV__) console.error('Error fetching users:', err);
      throw err;
    }
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    try {
      // Map role string to role_id
      let roleId = 4; // default to driver
      if (data.role === 'admin') roleId = 3;
      if (data.role === 'manager') roleId = 2;
      if (data.role === 'ceo') roleId = 1;

      const user = await dataService.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role_id: roleId,
        manager_id: data.manager_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return user as User;
    } catch (err: any) {
      if (__DEV__) console.error('Error creating user:', err);
      throw err;
    }
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
        manager_id: data.manager_id,
      };

      // Only update password if provided
      if (data.password) {
        updateData.password = data.password;
      }

      const user = await dataService.updateUser(id, updateData);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user as User;
    } catch (err: any) {
      if (__DEV__) console.error('Error updating user:', err);
      throw err;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const success = await dataService.deleteUser(id);
      if (!success) {
        throw new Error(`User with id ${id} not found`);
      }
    } catch (err: any) {
      if (__DEV__) console.error('Error deleting user:', err);
      throw err;
    }
  },
};


