import { useState, useEffect } from "react";
import {
 Elements,
 CardElement,
 useStripe,
 useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext.jsx";

function DevActivationForm({ subscriptionType, onSuccess, onCancel }) {
 const { sessionToken } = useAuth();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");
 setLoading(true);

 try {
 const response = await fetch("/api/subscription/activate-dev", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
 },
 body: JSON.stringify({ subscription_type: subscriptionType }),
 });

 const data = await response.json();
 if (!data.success) {
 throw new Error(data.error || "Failed to activate subscription");
 }

 onSuccess();
 } catch (err) {
 setError(err.message || "Activation failed");
 } finally {
 setLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="ui-card rounded-xl p-4">
 <div className="flex items-start gap-3">
 <svg className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div className="flex-1">
 <p className="text-sm font-semibold text-accent">Development Mode</p>
 <p className="mt-1 text-sm text-accent">
 Payment is bypassed in development. Your subscription will be activated immediately without any charge.
 </p>
 </div>
 </div>
 </div>
 {error && (
 <div className="badge-danger rounded-xl p-4">
 <div className="flex items-start gap-3">
 <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div className="flex-1">
 <p className="text-sm font-semibold">Activation Error</p>
 <p className="mt-1 text-sm">{error}</p>
 </div>
 </div>
 </div>
 )}
 <div className="flex gap-3">
 <button
 type="button"
 onClick={onCancel}
 disabled={loading}
 className="ui-btn ui-btn-secondary flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="ui-btn ui-btn-primary flex-1 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-50"
 >
 {loading ? "Activating..." : "Activate Subscription"}
 </button>
 </div>
 </form>
 );
}

function CheckoutForm({ subscriptionType, onSuccess, onCancel }) {
 const stripe = useStripe();
 const elements = useElements();
 const { sessionToken } = useAuth();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");

 if (!stripe || !elements) {
 return;
 }

 setLoading(true);

 try {
 // Create payment intent
 const response = await fetch("/api/payment/create-intent", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
 },
 body: JSON.stringify({ subscription_type: subscriptionType }),
 });

 const data = await response.json();
 if (!data.success) {
 throw new Error(data.error || "Failed to create payment intent");
 }

 // Confirm payment with the payment provider
 const cardElement = elements.getElement(CardElement);
 const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
 data.client_secret,
 {
 payment_method: {
 card: cardElement,
 },
 }
 );

 if (stripeError) {
 // Map provider error codes to user-friendly messages
 let errorMessage = stripeError.message;
 
 if (stripeError.code === "card_declined") {
 errorMessage = "Your card was declined. Please check your card details or try a different payment method.";
 } else if (stripeError.code === "insufficient_funds") {
 errorMessage = "Insufficient funds. Please use a different payment method.";
 } else if (stripeError.code === "expired_card") {
 errorMessage = "Your card has expired. Please use a different payment method.";
 } else if (stripeError.code === "incorrect_cvc") {
 errorMessage = "Your card's security code is incorrect. Please check and try again.";
 } else if (stripeError.code === "incorrect_number") {
 errorMessage = "Your card number is incorrect. Please check and try again.";
 } else if (stripeError.code === "processing_error") {
 errorMessage = "An error occurred while processing your card. Please try again.";
 } else if (stripeError.code === "generic_decline") {
 errorMessage = "Your card was declined. Please contact your bank or try a different payment method.";
 }
 
 throw new Error(errorMessage);
 }

 if (paymentIntent.status === "succeeded") {
 // Confirm payment on backend
 const confirmResponse = await fetch("/api/payment/confirm", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
 },
 body: JSON.stringify({
 payment_intent_id: paymentIntent.id,
 subscription_type: subscriptionType,
 }),
 });

 const confirmData = await confirmResponse.json();
 if (confirmData.success) {
 onSuccess();
 } else {
 throw new Error(confirmData.error || "Payment confirmation failed");
 }
 }
 } catch (err) {
 setError(err.message || "Payment failed");
 } finally {
 setLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="ui-card rounded-xl p-4">
 <CardElement
 options={{
 style: {
 base: {
 fontSize: "16px",
 color: "#424770",
 "::placeholder": {
 color: "#aab7c4",
 },
 },
 invalid: {
 color: "#9e2146",
 },
 },
 }}
 />
 </div>
 {error && (
 <div className="badge-danger rounded-xl p-4">
 <div className="flex items-start gap-3">
 <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div className="flex-1">
 <p className="text-sm font-semibold">Payment Error</p>
 <p className="mt-1 text-sm">{error}</p>
 <p className="mt-2 text-xs">
 Need help? Contact us at{" "}
 <a href="mailto:hello@startupideaadvisor.com" className="underline">
 hello@startupideaadvisor.com
 </a>
 </p>
 </div>
 </div>
 </div>
 )}
 <div className="flex gap-3">
 <button
 type="button"
 onClick={onCancel}
 disabled={loading}
 className="ui-btn ui-btn-secondary flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={!stripe || loading}
 className="ui-btn ui-btn-primary flex-1 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition disabled:opacity-50"
 >
 {loading ? "Processing..." : "Subscribe"}
 </button>
 </div>
 </form>
 );
}

export default function PaymentModal({ tier, onClose, onSuccess }) {
 const [stripeLoaded, setStripeLoaded] = useState(false);
 const [stripeInstance, setStripeInstance] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isDevMode, setIsDevMode] = useState(false);

 useEffect(() => {
 // Check if we're in development mode by checking for the payment provider key
 // If no key, assume dev mode and use dev activation endpoint
 const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
 
 if (!stripeKey || stripeKey.trim() === "") {
 // No key - assume development mode
 setIsDevMode(true);
 setLoading(false);
 return;
 }

 // Key exists - load payment provider for production
 setIsDevMode(false);
 const loadStripeLib = async () => {
 try {
 const { loadStripe } = await import("@stripe/stripe-js");
 const stripe = await loadStripe(stripeKey);
 setStripeInstance(stripe);
 setStripeLoaded(true);
 } catch (err) {
 setError("Failed to load the payment provider. Please try again.");
 console.error("Payment provider loading error:", err);
 } finally {
 setLoading(false);
 }
 };

 loadStripeLib();
 }, []);

 if (loading) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
 <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-xl font-bold text-primary">Subscribe to {tier.name}</h2>
 <button
 onClick={onClose}
 className="rounded-lg p-1 text-secondary transition hover:bg-surface-hover focus-visible:outline-accent"
 >
 ×
 </button>
 </div>
 <div className="flex items-center justify-center py-8">
 <div className="text-secondary">Loading...</div>
 </div>
 </div>
 </div>
 );
 }

 // Development mode - show simple activation form
 if (isDevMode) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
 <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-xl font-bold text-primary">Subscribe to {tier.name}</h2>
 <button
 onClick={onClose}
 className="rounded-lg p-1 text-secondary transition hover:bg-surface-hover focus-visible:outline-accent"
 >
 ×
 </button>
 </div>
 <div className="ui-card mb-4 rounded-xl p-4">
 <div className="flex items-baseline gap-2">
 <span className="text-3xl font-bold text-accent">{tier.price}</span>
 <span className="text-sm text-accent">{tier.period}</span>
 </div>
 <p className="mt-2 text-sm text-accent">{tier.description}</p>
 </div>
 <DevActivationForm
 subscriptionType={tier.id}
 onSuccess={onSuccess}
 onCancel={onClose}
 />
 </div>
 </div>
 );
 }

 // Production mode - show payment form
 if (error || !stripeLoaded || !stripeInstance) {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
 <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-xl font-bold text-primary">Subscribe to {tier.name}</h2>
 <button
 onClick={onClose}
 className="rounded-lg p-1 text-secondary transition hover:bg-surface-hover focus-visible:outline-accent"
 >
 ×
 </button>
 </div>
 <div className="ui-card rounded-xl p-4 text-center">
 <p className="text-sm text-accent">
 {error || "Payments are not configured. Please set the payment public key in your environment variables."}
 </p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
 <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-xl font-bold text-primary">Subscribe to {tier.name}</h2>
 <button
 onClick={onClose}
 className="rounded-lg p-1 text-secondary transition hover:bg-surface-hover focus-visible:outline-accent"
 >
 ×
 </button>
 </div>
 <div className="mb-4 ui-card rounded-xl p-4 bg-surface-muted">
 <div className="flex items-baseline gap-2">
 <span className="text-3xl font-bold text-accent">{tier.price}</span>
 <span className="text-sm text-secondary">{tier.period}</span>
 </div>
 <p className="mt-2 text-sm text-secondary">{tier.description}</p>
 </div>
 <Elements stripe={stripeInstance}>
 <CheckoutForm
 subscriptionType={tier.id}
 onSuccess={onSuccess}
 onCancel={onClose}
 />
 </Elements>
 </div>
 </div>
 );
}

