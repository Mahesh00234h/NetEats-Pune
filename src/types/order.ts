// src/types/order.ts

export type PuneLocation = 'Kothrud' | 'Baner' | 'Hinjawadi' | 'Wakad' | 'Shivajinagar';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Snacks' | 'Main Course' | 'Beverages' | 'Dessert';
  isVeg: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: PuneLocation;
  address: string;
  rating: number;
  prepTimeMinutes: number;
  ipAddress: string;
  menu: MenuItem[];
  coordinates: { x: number; y: number }; // Percentage on Pune SVG Map
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus =
  | 'Created'
  | 'Payment Pending'
  | 'Payment Confirmed'
  | 'Routing to Server'
  | 'Accepted by Restaurant'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Partner Assigned'
  | 'Picked Up'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Payment Failed'
  | 'Cancelled';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  currentLocationName: PuneLocation;
  currentCoords: { x: number; y: number };
  signalStatus: 'Connected' | 'Weak Signal' | 'Disconnected';
  ipAddress: string;
  queuedUpdatesCount: number;
}

export interface DeliveryOrder {
  id: string;
  idempotencyKey: string;
  customerId: string;
  customerName: string;
  customerLocation: PuneLocation;
  customerAddress: string;
  customerCoords: { x: number; y: number };
  customerIP: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLocation: PuneLocation;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Successful' | 'Failed' | 'Delayed Confirmation';
  paymentTxnId?: string;
  status: OrderStatus;
  assignedPartner?: DeliveryPartner;
  assignedServerId?: string;
  createdAt: string;
  updatedAt: string;
  currentJourneyStep: number;
  totalJourneySteps: number;
}

export interface OrderJourneyStep {
  stepNumber: number;
  title: string;
  source: string;
  destination: string;
  networkingConcept: string;
  protocol: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'retrying';
  delayMs: number;
  notes?: string;
}
