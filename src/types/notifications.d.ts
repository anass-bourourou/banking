
// Type definitions for notifications
import { Notification as CustomNotification } from '../services/NotificationService';

// Extend the global Notification type to work with our custom type
declare global {
  // Use a different name for the global notification type to avoid conflicts
  interface WebNotification extends Notification {}
  
  // Replace the global Notification with our custom type
  type Notification = CustomNotification;
}
