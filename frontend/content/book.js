// Book Your Session page copy (canvas page "4. Book Your Session"). The practitioner, services, time slots,
// prices and coupon results are records from the API.

export const BOOK = {
  title: 'Book Your Session',
  subtitle: 'Take the next step on your spiritual journey.',
  image: '/images/scenes/hero-goddess.jpg',
  trust: [
    { icon: 'shield-check', title: 'Secure Payments' },
    { icon: 'calendar-check', title: 'Easy Booking & Rescheduling' },
    { icon: 'headset', title: 'Customer Support' },
  ],
  steps: ['Select Service & Date', 'Add Details', 'Payment', 'Confirmation'],
  // Shown in the "Important Information" panel. The rescheduling line is added from the booking.cancel_hours setting.
  info: [
    'You will receive a confirmation email and SMS after payment.',
    'The session is held over a secure video link sent before the session.',
    'Rescheduling and refunds follow our Refund Policy.',
  ],
  supportLine: 'For support, contact our team',
  promiseTitle: 'Our Promise',
  promise: [
    { icon: 'shield-check', title: 'Secure Payments' },
    { icon: 'lock', title: 'Your Privacy Is Protected' },
    { icon: 'badge-check', title: 'Verified Practitioners' },
    { icon: 'headset', title: 'Customer Support Every Day' },
  ],
  afterTitle: 'What Happens After Booking?',
  afterSteps: [
    { icon: 'mail', title: 'Receive Confirmation', description: 'A booking confirmation arrives by email and SMS.' },
    { icon: 'calendar-check', title: 'Get Your Session Link', description: 'The video link arrives before the session.' },
    { icon: 'video', title: 'Join the Session', description: 'Join on time using the link provided.' },
    { icon: 'file-text', title: 'Get Follow-Up Support', description: 'Receive your practitioner’s guidance and follow-up notes.' },
  ],
  purposeHelper: 'Please do not include health, financial or other sensitive details.',
  summaryNote: 'Inclusive of all taxes. Rescheduling and refunds follow our Refund Policy.',
  // No payment gateway is connected yet; the button records a pending booking (see the project README).
  paymentNote: 'Secure, encrypted payments. Online payment opens once the payment gateway is connected.',
  payLabel: 'Pay Now',
  submittingLabel: 'Reserving your slot…',
  chooseTimeLabel: 'Choose a time',
  changeServiceLabel: 'Change Service',
  chooseTitle: 'Choose Your Tantric',
  chooseSubtitle: 'Pick a practitioner to see their services and available times.',
  chooseAction: 'Browse All Tantrics',
  noServices: 'This practitioner has not listed bookable services yet.',
  confirmation: {
    pendingTitle: 'Booking Received',
    confirmedTitle: 'Booking Confirmed',
    message: 'Your slot is reserved. You will receive the session link by email once the booking is confirmed.',
    note: 'Keep your booking reference for any support request.',
    pendingMethod: 'Pending',
  },
};
