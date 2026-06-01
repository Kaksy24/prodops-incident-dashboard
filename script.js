const categories = document.querySelectorAll('.menu-category');
const incidentButtons = document.querySelectorAll('.incident-btn');
const modal = document.getElementById('ticketModal');
const incidentTypeInput = document.getElementById('incidentType');
const ticketForm = document.getElementById('ticketForm');
const closeButtons = document.querySelectorAll('.close-modal');

function openModal(incidentName) {
  incidentTypeInput.value = incidentName;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

categories.forEach((category) => {
  const toggle = category.querySelector('.category-toggle');

  toggle.addEventListener('click', () => {
    const isOpen = category.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

incidentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openModal(button.dataset.incident || 'Incident non specificato');
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', closeModal);
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('show')) {
    closeModal();
  }
});

ticketForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(ticketForm);
  const payload = Object.fromEntries(formData.entries());

  console.log('Ticket creato:', payload);
  alert('Ticket creato con successo. Controlla la console per i dettagli.');

  ticketForm.reset();
  incidentTypeInput.value = payload.incidentType;
  closeModal();
});
