export type NotificationCallback = (notification: any) => void;

export type NotificationObserver = NotificationCallback;

export class NotificationManager {
  private static instance: NotificationManager;
  private observers: NotificationCallback[] = [];

  private constructor() {
    // NOTE:
    // For SDK 53+ in Expo Go, remote push notifications are not supported and
    // importing `expo-notifications` can crash the app.
    //
    // For this school project we keep a lightweight in-app observer bus only.
  }

  static getInstance() {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  subscribe(observer: NotificationCallback) {
    this.observers.push(observer);
  }

  unsubscribe(observer: NotificationCallback) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  private notifyAll(notification: any) {
    this.observers.forEach(observer => observer(notification));
  }

  notifyDriver(driverId: number, message: string) {
    this.notifyAll({ type: "driver", driverId, message });
  }

  notifyManagers(managerIds: number[], message: string) {
    managerIds.forEach(id =>
      this.notifyAll({ type: "manager", managerId: id, message })
    );
  }
}
