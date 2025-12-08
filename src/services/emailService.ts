import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Get these from https://dashboard.emailjs.com/admin
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send email notification when a new room is created
 * @param roomData - Information about the created room
 */
export async function sendRoomCreatedNotification(roomData: {
  roomId: string;
  roomName: string;
  participantCount: number;
  participantNames: string[];
  isSecured: boolean;
  creatorName?: string;
  creatorEmail?: string;
}): Promise<void> {
  try {
    // Template parameters that will be inserted into your EmailJS template
    const templateParams = {
      room_name: roomData.roomName,
      room_id: roomData.roomId,
      participant_count: roomData.participantCount,
      participant_names: roomData.participantNames.join(', '),
      is_secured: roomData.isSecured ? 'Yes (PIN protected)' : 'No',
      creator_name: roomData.creatorName || 'Anonymous',
      creator_email: roomData.creatorEmail || 'Not provided',
      created_at: new Date().toLocaleString(),
      room_url: `${window.location.origin}/room/${roomData.roomId}`,
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw - we don't want to fail room creation if email fails
  }
}
