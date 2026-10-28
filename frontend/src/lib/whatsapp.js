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
    return `Hello ${BRAND_INFO.name},\n\nI would like to enquire about your homemade Andhra pickles & sweets.\n\nThank you!`;
  }

  let itemsSubtotal = 0;

  const itemsList = cartItems.map((item, index) => {
    const itemPrice = item.price || item.unitPrice || item.pricePerKg || 0;
    const itemTotal = itemPrice * item.quantity;
    itemsSubtotal += itemTotal;
    const variantStr = item.variantLabel || item.variant || '1 kg';
    const packsStr = item.quantity > 1 ? ` × ${item.quantity} packs` : ` × 1 pack`;
    return `${index + 1}. *${item.name}* (${variantStr})${packsStr} — ₹${itemTotal.toLocaleString('en-IN')}`;
  }).join('\n');

  const hasDeliveryFee = typeof customerDetails.deliveryFee === 'number' && Number.isFinite(customerDetails.deliveryFee) && customerDetails.deliveryFee >= 0;
  const deliveryFee = hasDeliveryFee ? customerDetails.deliveryFee : (itemsSubtotal >= 2000 ? 0 : 99);
  const grandTotal = itemsSubtotal + deliveryFee;

  const orderId = customerDetails.orderId ? `#${customerDetails.orderId}` : 'New Website Order';

  const deliveryText = deliveryFee === 0
    ? 'FREE (Order above ₹2,000) 🎉'
    : `₹${deliveryFee.toLocaleString('en-IN')}`;

  // Clean, professional, structured WhatsApp template (Universal UTF-8 safe emojis)
  let message = `*BRAMARAMBIKA HOME FOODS — ORDER REQUEST*\n\n`;
  message += `Namaste! I would like to place this order. Please confirm availability and the next steps.\n\n`;
  if (customerDetails.orderId) message += `📋 *Website reference:* ${orderId}\n`;
  message += `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;
  message += `🛒 *ORDERED DELICACIES:*\n${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Items Subtotal:* ₹${itemsSubtotal.toLocaleString('en-IN')}\n`;
  message += `📦 *Delivery Fee:* ${deliveryText}\n`;
  message += `💳 *Payment:* Official Kitchen UPI (7793910819@ybl)\n`;
  message += `💰 *Total Amount:* ₹${grandTotal.toLocaleString('en-IN')}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const { name, phone, address, pincode, notes, paymentScreenshot } = customerDetails;
  message += `📍 *DELIVERY DESTINATION:*\n`;
  if (name && name.trim()) message += `• *Customer:* ${name.trim()}\n`;
  if (phone && phone.trim()) message += `• *Mobile:* ${phone.trim()}\n`;
  if (address && address.trim()) message += `• *Address:* ${address.trim()}\n`;
  if (pincode && pincode.trim()) message += `• *Pincode:* ${pincode.trim()}\n`;

  // Only include genuine kitchen request notes
  if (notes && notes.trim() && !notes.includes('Order ID:')) {
    message += `\n📝 *Kitchen Request:* ${notes.trim()}\n`;
  }

  // Payment proof screenshot handling
  if (paymentScreenshot && typeof paymentScreenshot === 'string') {
    if (paymentScreenshot.startsWith('http')) {
      message += `\n📸 *Payment Proof Receipt:* ${paymentScreenshot}\n`;
    } else {
      message += `\n📸 *Payment Proof:* (Attached screenshot in this chat)\n`;
    }
  }

  if (paymentScreenshot) message += `\n📸 A payment receipt is included for your review. Please verify it directly.\n`;
  message += `\nI understand that opening WhatsApp does not complete the order. I will send this message to the kitchen to continue. Dhanyavadalu! 🙏`;

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

export function getPromoClaimWhatsAppUrl(giftName) {
  const giftSuffix = giftName ? ` - ${giftName}` : '';
  const text = `Hello ${BRAND_INFO.name},\n\nI saw your First Order Surprise Gift banner offer on your website and would like to claim my FREE GIFT${giftSuffix}!\n\nPlease share the menu and let me know how to proceed with placing my order.\n\nThank you!`;
  const cleanPhone = BRAND_INFO.whatsappNumber.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(text)}`;
}
