export function generateRoomCode() {
  return Math.random().toString(36).slice(3, 7).toUpperCase();
}