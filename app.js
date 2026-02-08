const TYPE_ICONS = {
  flight: '✈️',
  hotel: '🏨',
  restaurant: '🍽️',
  activity: '🎯',
  transport: '🚕',
};

function renderItem(item) {
  const icon = TYPE_ICONS[item.type] || '📌';

  let actions = '';
  if (item.ticketUrl || item.directionsUrl) {
    actions = '<div class="card-actions">';
    if (item.ticketUrl) {
      actions += `<a href="${item.ticketUrl}" target="_blank" rel="noopener" class="btn-tickets">🎟 Tickets</a>`;
    }
    if (item.directionsUrl) {
      actions += `<a href="${item.directionsUrl}" target="_blank" rel="noopener" class="btn-directions">📍 Directions</a>`;
    }
    actions += '</div>';
  }

  return `
    <div class="card">
      <div class="card-top">
        <div class="card-icon">${icon}</div>
        <div class="card-info">
          <div class="card-time">${item.time}</div>
          <div class="card-title">${item.title}</div>
          ${item.location ? `<div class="card-location">${item.location}</div>` : ''}
        </div>
      </div>
      ${item.description ? `<div class="card-description">${item.description}</div>` : ''}
      ${actions}
    </div>`;
}

function renderDay(day) {
  const items = day.items.map(renderItem).join('');
  return `
    <section class="day-section">
      <div class="day-header">${day.label}</div>
      ${items}
    </section>`;
}

async function init() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading">Loading itinerary…</div>';

  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Failed to load data');
    const data = await res.json();

    document.querySelector('header h1').textContent = data.title || 'My Vacation';
    document.title = data.title || 'Vacation Itinerary';

    app.innerHTML = data.days.map(renderDay).join('');
  } catch (err) {
    app.innerHTML = `<div class="error">Could not load itinerary.<br>${err.message}</div>`;
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

init();
