/* Reservations: success is shown only after ajax/reservations/create.php confirms the save. */
document.addEventListener('DOMContentLoaded', () => {
  const f = document.getElementById('resForm');
  f.date.min = new Date().toISOString().slice(0, 10); // demo rule; backend enforces real advance-booking limits
  ILE.handleForm(f, 'reservations/create.php', () => {
    location.href = 'reservation-success.html';
  });
});
