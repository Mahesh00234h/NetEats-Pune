// src/components/pages/OrderFlowPage.tsx
import React, { useState } from 'react';
import {
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  MapPin,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useSimulation } from '../../simulation/simulationContext';
import { PuneLocation, DeliveryOrder } from '../../types/order';

interface OrderFlowPageProps {
  onNavigateToTracking?: () => void;
  onNavigateToTopology?: () => void;
}

export const OrderFlowPage: React.FC<OrderFlowPageProps> = ({ onNavigateToTracking, onNavigateToTopology }) => {
  const {
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    orders,
    activeOrder,
    setActiveOrder,
    placeOrder,
    updateOrderStatus,
    reconcilePayment,
    userRole,
    setUserRole,
    orderJourneySteps,
    activeJourneyStepIndex,
    runStepByStepJourney,
    advanceSingleJourneyStep,
    resetJourney,
    faultConfig,
  } = useSimulation();

  const [paymentMethod, setPaymentMethod] = useState<DeliveryOrder['paymentMethod']>('UPI');
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PuneLocation | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'ordering' | 'journey'>('ordering');

  const filteredRestaurants =
    selectedLocation === 'All' ? restaurants : restaurants.filter((r) => r.location === selectedLocation);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 35 : 0;
  const gstTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + deliveryFee + gstTax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    try {
      await placeOrder(paymentMethod);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Role Selector & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
              Functional Pune Food Delivery Pipeline
            </h1>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-xs font-semibold text-cyan-300">
              Section 6 & 13
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete customer checkout, restaurant kitchen dashboard, delivery partner assignment, and 18-step network journey.
          </p>
        </div>

        {/* View Switcher: Interactive Demo vs 18-Step Network Journey */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ordering')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition ${
              activeTab === 'ordering'
                ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Storefront & Role Views
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition ${
              activeTab === 'journey'
                ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            18-Step Order Journey
          </button>
        </div>
      </div>

      {activeTab === 'ordering' ? (
        <div>
          {/* Active Role Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Current Role View:</span>
              <span className="font-bold text-cyan-400 uppercase tracking-wide">{userRole}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {(['customer', 'restaurant', 'delivery', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    userRole === r
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {r === 'customer' ? 'Customer' : r === 'restaurant' ? 'Restaurant POS' : r === 'delivery' ? 'Delivery Partner' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOMER VIEW */}
          {userRole === 'customer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Restaurants & Menus */}
              <div className="lg:col-span-2 space-y-6">
                {/* Location Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      Select Pune Neighborhood:
                    </span>
                    <span className="text-[11px] text-slate-500">Kothrud, Baner, Hinjawadi, Wakad, Shivajinagar</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['All', 'Kothrud', 'Baner', 'Hinjawadi', 'Wakad', 'Shivajinagar'] as const).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                          selectedLocation === loc
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Restaurant Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredRestaurants.map((rest) => (
                    <div
                      key={rest.id}
                      onClick={() => setSelectedRestaurant(rest)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        selectedRestaurant.id === rest.id
                          ? 'border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/30'
                          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-100">{rest.name}</h3>
                          <span className="inline-block text-[11px] text-cyan-400 font-medium">{rest.location}</span>
                        </div>
                        <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[11px] font-bold text-amber-300">
                          ★ {rest.rating}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{rest.cuisine}</p>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                        <span>Prep Time: ~{rest.prepTimeMinutes} mins</span>
                        <span className="font-mono text-slate-400">IP: {rest.ipAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Menu of Selected Restaurant */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-100">{selectedRestaurant.name} Menu</h2>
                      <p className="text-xs text-slate-400">{selectedRestaurant.address}</p>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                      Node: {selectedRestaurant.ipAddress}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedRestaurant.menu.map((item) => {
                      const inCart = cart.find((c) => c.menuItem.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/50 p-3 transition hover:border-slate-700"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-rose-500'}`}
                              />
                              <h4 className="text-sm font-semibold text-slate-200">{item.name}</h4>
                              <span className="text-[10px] uppercase font-semibold text-slate-500">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 max-w-md">{item.description}</p>
                            <div className="text-xs font-bold text-cyan-400">₹{item.price}</div>
                          </div>

                          <div>
                            {inCart ? (
                              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                                <button
                                  onClick={() => updateCartQty(item.id, inCart.quantity - 1)}
                                  className="p-1 rounded text-slate-300 hover:bg-slate-800"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="font-mono text-xs font-bold px-1.5 text-slate-100">
                                  {inCart.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQty(item.id, inCart.quantity + 1)}
                                  className="p-1 rounded text-slate-300 hover:bg-slate-800"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Col: Cart, Simulated Checkout & Live Network Telemetry */}
              <div className="space-y-6">
                {/* Cart Card */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sticky top-20">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-cyan-400" />
                      Demo Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                    </h3>
                    {cart.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Your cart is empty. Browse Pune restaurants to add authentic dishes.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.menuItem.id} className="flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-slate-200">{item.menuItem.name}</div>
                              <div className="text-slate-500">₹{item.menuItem.price} × {item.quantity}</div>
                            </div>
                            <div className="font-mono font-bold text-slate-300">
                              ₹{item.menuItem.price * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bill Breakdown */}
                      <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-mono text-slate-200">₹{cartSubtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee (Kothrud):</span>
                          <span className="font-mono text-slate-200">₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (5%):</span>
                          <span className="font-mono text-slate-200">₹{gstTax}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800/80 pt-2 font-bold text-sm text-slate-100">
                          <span>Total:</span>
                          <span className="font-mono text-cyan-400">₹{cartTotal}</span>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="border-t border-slate-800 pt-3">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                          Simulated Payment Method:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {(['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setPaymentMethod(m)}
                              className={`rounded-lg py-1.5 px-2 text-xs font-semibold border transition text-center ${
                                paymentMethod === m
                                  ? 'border-purple-500 bg-purple-950/40 text-purple-300'
                                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Place Order CTA */}
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isOrdering}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-3 text-xs font-bold text-slate-950 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                      >
                        {isOrdering ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Establishing TLS & Forwarding Packets...
                          </span>
                        ) : (
                          <>
                            <ShoppingBag className="h-4 w-4" />
                            <span>Place Order (₹{cartTotal})</span>
                          </>
                        )}
                      </button>

                      {/* Technical Footnote */}
                      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-[11px] text-slate-400">
                        <div className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Networking Pipeline</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-500">
                          Clicking "Place Order" transmits an HTTPS request through Wi-Fi AP (192.168.1.1),
                          Edge Router (10.0.1.1), Firewall (10.0.2.1), NGINX Load Balancer (10.0.3.10), and commits
                          to PostgreSQL (10.0.5.20) with unique Idempotency Keys.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RESTAURANT VIEW */}
          {userRole === 'restaurant' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <UtensilsCrossed className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Restaurant Kitchen POS Terminal</h2>
                    <p className="text-xs text-slate-400">Baner Biryani & Spice House • IP: 192.168.2.80 (WebSocket Connected)</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  WSS Channel Open
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No incoming orders yet. Switch to "Customer" role and place a food order to trigger real-time WebSocket push.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400 text-sm">Order #{order.id}</span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                            Idempotency: {order.idempotencyKey.slice(0, 16)}...
                          </span>
                        </div>
                        <span className="rounded-full bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                          Status: {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500 block">Customer:</span>
                          <span className="font-semibold text-slate-200">{order.customerName} ({order.customerLocation})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Items:</span>
                          <span className="text-slate-300">
                            {order.items.map((i) => `${i.menuItem.name} (x${i.quantity})`).join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Total Bill:</span>
                          <span className="font-mono font-bold text-slate-100">₹{order.total} ({order.paymentMethod})</span>
                        </div>
                      </div>

                      {/* Kitchen Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        {order.status === 'Payment Confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Accepted by Restaurant')}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition"
                          >
                            Accept Order (Kitchen ACK)
                          </button>
                        )}
                        {order.status === 'Accepted by Restaurant' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Preparing')}
                            className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition"
                          >
                            Start Cooking (Preparing)
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition"
                          >
                            Mark Ready for Pickup
                          </button>
                        )}
                        {order.status === 'Ready for Pickup' && (
                          <span className="text-xs text-slate-400">
                            Food packaged. Awaiting delivery partner pickup notification.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DELIVERY PARTNER VIEW */}
          {userRole === 'delivery' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Delivery Partner Mobile App (5G)</h2>
                    <p className="text-xs text-slate-400">Rider: Ramesh Pawar • IP: 192.168.3.99 • Battery: 88%</p>
                  </div>
                </div>
                <button
                  onClick={onNavigateToTracking}
                  className="rounded-lg bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition"
                >
                  View Pune Live Map
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No assigned deliveries right now. Place an order to dispatch a delivery mission.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-400 text-sm">Order #{order.id}</span>
                        <span className="text-xs font-semibold text-slate-300">
                          Pickup: {order.restaurantLocation} ➔ Drop: {order.customerLocation}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        {order.status === 'Ready for Pickup' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Picked Up')}
                            className="rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-semibold text-slate-100 transition"
                          >
                            Confirm Pickup & Start Trip
                          </button>
                        )}
                        {order.status === 'Picked Up' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition"
                          >
                            Mark Delivered to Customer (TCP FIN)
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Delivered to Kothrud! Socket closed.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADMIN & PAYMENT RECONCILIATION VIEW */}
          {userRole === 'admin' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Network Administrator & Transaction Reconciliation</h2>
                    <p className="text-xs text-slate-400">Idempotency deduplication & delayed webhook recovery engine</p>
                  </div>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No orders generated in this session yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-400">Order #{ord.id}</span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Txn: {ord.paymentTxnId || 'N/A'}
                          </span>
                        </div>
                        <div className="text-slate-400 mt-1">
                          Payment: <span className="font-semibold text-slate-200">{ord.paymentStatus}</span> | Status: <span className="font-semibold text-slate-200">{ord.status}</span>
                        </div>
                      </div>

                      {ord.paymentStatus !== 'Successful' && ord.status !== 'Payment Confirmed' && (
                        <button
                          onClick={() => reconcilePayment(ord.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-900/40 transition"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Reconcile Transaction (Idempotency Safe)</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* SECTION 13: 18-STEP VISUAL ORDER JOURNEY */
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                18-Step End-to-End Network Journey
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                From Customer Socket in Kothrud to Kitchen Terminal in Baner and GPS Rider Dispatch
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runStepByStepJourney(activeOrder?.id)}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition shadow"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Full Journey</span>
              </button>
              <button
                onClick={advanceSingleJourneyStep}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Next Step</span>
              </button>
              <button
                onClick={resetJourney}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
            {orderJourneySteps.map((step, idx) => {
              const isCurrent = idx === activeJourneyStepIndex;
              const isPast = step.status === 'completed';
              const isFailed = step.status === 'failed';

              return (
                <div
                  key={step.stepNumber}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isCurrent
                      ? 'border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-950/40'
                      : isFailed
                      ? 'border-rose-500 bg-rose-950/20'
                      : isPast
                      ? 'border-slate-800/60 bg-slate-950/40'
                      : 'border-slate-800/40 bg-slate-950/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isFailed
                            ? 'bg-rose-500 text-slate-950'
                            : isPast
                            ? 'bg-emerald-500 text-slate-950'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPast ? '✓' : step.stepNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-100">{step.title}</h4>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                            {step.protocol}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {step.source} ➔ {step.destination}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                        <div className="mt-1.5 text-[11px] text-cyan-400/90 font-medium">
                          Concept: <span className="text-slate-300">{step.networkingConcept}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isFailed
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : isPast
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 animate-pulse'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
