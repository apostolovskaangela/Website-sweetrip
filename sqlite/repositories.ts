import { SQLiteDatabase } from 'expo-sqlite';
import {
  User,
  Vehicle,
  Trip,
  TripStop,
  TripWithRelations,
  VehicleWithRelations,
  UserWithRelations,
} from './models';

/**
 * Base Repository class with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string = '';

  constructor(protected db: SQLiteDatabase) {}

  async findAll(): Promise<T[]> {
    const result = await this.db.getAllAsync(`SELECT * FROM ${this.tableName}`);
    return result as T[];
  }

  async findById(id: number): Promise<T | null> {
    const result = await this.db.getFirstAsync(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return (result as T) || null;
  }

  async create(data: Partial<T>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(',');

    const result = await this.db.runAsync(
      `INSERT INTO ${this.tableName} (${keys.join(',')}) VALUES (${placeholders})`,
      values
    );

    return result.lastInsertRowId;
  }

  async update(id: number, data: Partial<T>): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(',');

    await this.db.runAsync(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async deleteAll(): Promise<void> {
    await this.db.runAsync(`DELETE FROM ${this.tableName}`);
  }

  async count(): Promise<number> {
    const result = await this.db.getFirstAsync(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    return (result as any)?.count || 0;
  }
}

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<User> {
  tableName = 'users';

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (result as User) || null;
  }

  async findByRoleId(roleId: number): Promise<User[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM users WHERE role_id = ? ORDER BY name',
      [roleId]
    );
    return result as User[];
  }

  async findDriversByManagerId(managerId: number): Promise<User[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM users WHERE manager_id = ? AND role_id = 4 ORDER BY name',
      [managerId]
    );
    return result as User[];
  }

  async findByManagerId(managerId: number): Promise<User[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM users WHERE manager_id = ? ORDER BY name',
      [managerId]
    );
    return result as User[];
  }

  async findWithRelations(id: number): Promise<UserWithRelations | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const manager = user.manager_id ? await this.findById(user.manager_id) : undefined;
    const drivers = await this.findDriversByManagerId(id);

    return {
      ...user,
      manager,
      drivers,
    };
  }

  async findCeo(): Promise<User | null> {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM users WHERE role_id = 1 LIMIT 1'
    );
    return (result as User) || null;
  }

  async findManagers(): Promise<User[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM users WHERE role_id = 2 ORDER BY name'
    );
    return result as User[];
  }

  async findDrivers(): Promise<User[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM users WHERE role_id = 4 ORDER BY name'
    );
    return result as User[];
  }
}

/**
 * Vehicle Repository
 */
export class VehicleRepository extends BaseRepository<Vehicle> {
  tableName = 'vehicles';

  async findByRegistrationNumber(regNumber: string): Promise<Vehicle | null> {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM vehicles WHERE registration_number = ?',
      [regNumber]
    );
    return (result as Vehicle) || null;
  }

  async findByManagerId(managerId: number): Promise<Vehicle[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM vehicles WHERE manager_id = ? ORDER BY registration_number',
      [managerId]
    );
    return result as Vehicle[];
  }

  async findActive(): Promise<Vehicle[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM vehicles WHERE is_active = 1 ORDER BY registration_number'
    );
    return result as Vehicle[];
  }

  async findWithRelations(id: number): Promise<VehicleWithRelations | null> {
    const vehicle = await this.findById(id);
    if (!vehicle) return null;

    const userRepo = new UserRepository(this.db);
    const tripRepo = new TripRepository(this.db);
    const manager = await userRepo.findById(vehicle.manager_id);
    const trips = await tripRepo.findByVehicleId(vehicle.id);

    return {
      ...vehicle,
      manager,
      trips,
    };
  }
}

/**
 * Trip Repository
 */
export class TripRepository extends BaseRepository<Trip> {
  tableName = 'trips';

  async findByTripNumber(tripNumber: string): Promise<Trip | null> {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM trips WHERE trip_number = ?',
      [tripNumber]
    );
    return (result as Trip) || null;
  }

  async findByDriverId(driverId: number): Promise<Trip[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM trips WHERE driver_id = ? ORDER BY trip_date DESC',
      [driverId]
    );
    return result as Trip[];
  }

  async findByVehicleId(vehicleId: number): Promise<Trip[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM trips WHERE vehicle_id = ? ORDER BY trip_date DESC',
      [vehicleId]
    );
    return result as Trip[];
  }

  async findByStatus(status: string): Promise<Trip[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM trips WHERE status = ? ORDER BY trip_date DESC',
      [status]
    );
    return result as Trip[];
  }

  async findByDate(date: string): Promise<Trip[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM trips WHERE trip_date = ? ORDER BY created_at DESC',
      [date]
    );
    return result as Trip[];
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Trip[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM trips WHERE trip_date BETWEEN ? AND ? ORDER BY trip_date DESC',
      [startDate, endDate]
    );
    return result as Trip[];
  }

  async findWithRelations(id: number): Promise<TripWithRelations | null> {
    const trip = await this.findById(id);
    if (!trip) return null;

    const userRepo = new UserRepository(this.db);
    const vehicleRepo = new VehicleRepository(this.db);
    const stopRepo = new TripStopRepository(this.db);

    const driver = await userRepo.findById(trip.driver_id);
    const vehicle = await vehicleRepo.findById(trip.vehicle_id);
    const stops = await stopRepo.findByTripId(trip.id);
    const creator = trip.created_by ? await userRepo.findById(trip.created_by) : undefined;

    return {
      ...trip,
      driver,
      vehicle,
      stops,
      creator,
    };
  }

  async getActiveTripsByManager(managerId: number): Promise<Trip[]> {
    const result = await this.db.getAllAsync(
      `SELECT trips.* FROM trips
       JOIN vehicles ON trips.vehicle_id = vehicles.id
       WHERE vehicles.manager_id = ? AND trips.status != 'completed'
       ORDER BY trips.trip_date DESC`,
      [managerId]
    );
    return result as Trip[];
  }

  async updateStatus(tripId: number, status: string): Promise<void> {
    await this.update(tripId, { status } as Partial<Trip>);
  }
}

/**
 * Trip Stop Repository
 */
export class TripStopRepository extends BaseRepository<TripStop> {
  tableName = 'trip_stops';

  async findByTripId(tripId: number): Promise<TripStop[]> {
    const result = await this.db.getAllAsync(
      'SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC',
      [tripId]
    );
    return result as TripStop[];
  }

  async findByTripIdAndOrder(tripId: number, order: number): Promise<TripStop | null> {
    const result = await this.db.getFirstAsync(
      'SELECT * FROM trip_stops WHERE trip_id = ? AND stop_order = ?',
      [tripId, order]
    );
    return (result as TripStop) || null;
  }

  async deleteByTripId(tripId: number): Promise<void> {
    await this.db.runAsync('DELETE FROM trip_stops WHERE trip_id = ?', [tripId]);
  }

  async getNextStopOrder(tripId: number): Promise<number> {
    const result = await this.db.getFirstAsync(
      'SELECT MAX(stop_order) as max_order FROM trip_stops WHERE trip_id = ?',
      [tripId]
    );
    return ((result as any)?.max_order || 0) + 1;
  }
}

/**
 * Repository Factory
 */
export class RepositoryFactory {
  private userRepository: UserRepository | null = null;
  private vehicleRepository: VehicleRepository | null = null;
  private tripRepository: TripRepository | null = null;
  private tripStopRepository: TripStopRepository | null = null;

  constructor(private db: SQLiteDatabase) {}

  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(this.db);
    }
    return this.userRepository;
  }

  getVehicleRepository(): VehicleRepository {
    if (!this.vehicleRepository) {
      this.vehicleRepository = new VehicleRepository(this.db);
    }
    return this.vehicleRepository;
  }

  getTripRepository(): TripRepository {
    if (!this.tripRepository) {
      this.tripRepository = new TripRepository(this.db);
    }
    return this.tripRepository;
  }

  getTripStopRepository(): TripStopRepository {
    if (!this.tripStopRepository) {
      this.tripStopRepository = new TripStopRepository(this.db);
    }
    return this.tripStopRepository;
  }
}
