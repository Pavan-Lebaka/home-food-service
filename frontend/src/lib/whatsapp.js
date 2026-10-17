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

  // Delivery rule
  const isFreeDelivery = itemsSubtotal >= 2000;
  const deliveryFee = typeof customerDetails.deliveryFee === 'number' 
    ? customerDetails.deliveryFee 
    : (isFreeDelivery ? 0 : 100);
  const grandTotal = itemsSubtotal + deliveryFee;

  const orderId = customerDetails.orderId ? `#${customerDetails.orderId}` : 'New Website Order';
  const courierInfo = customerDetails.courierName 
    ? `${customerDetails.courierName}${customerDetails.estimatedDelivery ? ` (${customerDetails.estimatedDelivery})` : ''}` 
    : 'Standard Express Courier';
  const paymentMode = customerDetails.paymentMethod 
    ? customerDetails.paymentMethod 
    : 'Cash on Delivery / UPI';

  const deliveryText = deliveryFee === 0 
    ? 'FREE (Order above ₹2,000 🎉)' 
    : `₹${deliveryFee}`;

  // Clean, professional, structured WhatsApp template (Universal UTF-8 safe emojis)
  let message = `✨ *BRAMARAMBIKA HOME FOODS — ORDER CONFIRMATION* ✨\n\n`;
  message += `Namaste! I have placed an order on your kitchen website.\n\n`;
  message += `📋 *Order ID:* ${orderId}\n`;
  message += `📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;
  message += `🛒 *ORDERED DELICACIES:*\n${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Items Subtotal:* ₹${itemsSubtotal.toLocaleString('en-IN')}\n`;
  message += `🚚 *Courier Partner:* ${courierInfo}\n`;
  message += `📦 *Delivery Fee:* ${deliveryText}\n`;
  message += `💳 *Payment Mode:* Direct UPI on WhatsApp\n`;
  message += `🔥 *Grand Total Payable:* ₹${grandTotal.toLocaleString('en-IN')}\n`;
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

  message += `\n⏳ *Kitchen Timeline:* 1–2 days fresh cooking & leak-proof packaging + 2–3 days express courier transit.\n\n`;

  if (paymentScreenshot) {
    message += `I have attached my payment receipt for instant verification. Please confirm my order preparation & dispatch timeline. Dhanyavadalu! 🙏`;
  } else {
    message += `Please share your verified UPI QR code or GPay/PhonePe number so I can complete payment and you can start preparing. Dhanyavadalu! 🙏`;
  }

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
