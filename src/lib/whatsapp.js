import { BRAND_INFO } from '../data/products.js';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateWhatsAppOrderMessage(cartItems, customerDetails = {}) {
  if (!cartItems || cartItems.length === 0) {
    return `Hello ${BRAND_INFO.name},\n\nI would like to enquire about your homemade specials.\n\nThank you.`;
  }

  let itemsSubtotal = 0;
  const deliveryFee = 100; // Flat Rs. 100 Delivery

  const itemsList = cartItems.map((item, index) => {
    const itemPrice = item.price || item.unitPrice || item.pricePerKg || 0;
    const itemTotal = itemPrice * item.quantity;
    itemsSubtotal += itemTotal;
    const variantStr = item.variantLabel ? ` (${item.variantLabel})` : '';
    const packsStr = item.quantity > 1 ? ` × ${item.quantity} packs` : ` × 1 pack`;
    return `${index + 1}. ${item.name}${variantStr}${packsStr} - ₹${itemTotal.toLocaleString('en-IN')}`;
  }).join('\n');

  const grandTotal = itemsSubtotal + deliveryFee;

  let message = `Hello ${BRAND_INFO.name},\n\nI would like to place an order from your website:\n\n${itemsList}\n\n─────────────────────\nItems Subtotal: ₹${itemsSubtotal.toLocaleString('en-IN')}\nDelivery: ₹${deliveryFee} (Flat Delivery)\nTotal Payable: ₹${grandTotal.toLocaleString('en-IN')}`;

  const { name, address, notes } = customerDetails;
  const details = [];
  if (name && name.trim()) details.push(`Name: ${name.trim()}`);
  if (address && address.trim()) details.push(`Delivery Address: ${address.trim()}`);
  if (notes && notes.trim()) details.push(`Notes: ${notes.trim()}`);

  if (details.length > 0) {
    message += `\n─────────────────────\n${details.join('\n')}`;
  }

  message += `\n\nPlease confirm my order and share payment details (UPI/GPay/PhonePe).\n\nThank you!`;

  return message;
}

export function getWhatsAppOrderUrl(cartItems, customerDetails = {}) {
  const text = generateWhatsAppOrderMessage(cartItems, customerDetails);
  const cleanPhone = BRAND_INFO.whatsappNumber.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
}

export function getDirectWhatsAppChatUrl() {
  const text = `Hello ${BRAND_INFO.name},\n\nI am interested in your authentic homemade Telugu sweets & pickles. Could you please share today's fresh batch menu?`;
  const cleanPhone = BRAND_INFO.whatsappNumber.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
}
