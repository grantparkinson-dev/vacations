// Auto dark mode based on Las Vegas time (Pacific)
function updateDarkMode() {
  const vegasHour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  ).getHours();
  const isNight = vegasHour >= 18 || vegasHour < 6;
  document.body.classList.toggle('dark', isNight);

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = isNight ? '#1a1028' : '#f2a6c7';
  }
}

updateDarkMode();
setInterval(updateDarkMode, 60000);

const TYPE_ICONS = {
  flight: '\u2728\u2708\uFE0F',
  hotel: '\uD83C\uDF1F',
  restaurant: '\uD83C\uDF38',
  activity: '\uD83C\uDF80',
  transport: '\uD83D\uDC96',
  show: '\u2728',
};

function renderItem(item, index) {
  const icon = TYPE_ICONS[item.type] || '\uD83C\uDF80';

  let actions = '';
  if (item.ticketUrl || item.tickets || item.directionsUrl) {
    actions = '<div class="card-actions">';
    if (item.tickets) {
      item.tickets.forEach((t) => {
        actions += `<a href="${t.url}" target="_blank" rel="noopener" class="btn-tickets">\uD83C\uDF9F ${t.label}</a>`;
      });
    } else if (item.ticketUrl) {
      actions += `<a href="${item.ticketUrl}" target="_blank" rel="noopener" class="btn-tickets">\uD83C\uDF9F\uFE0F Tickets</a>`;
    }
    if (item.directionsUrl) {
      actions += `<a href="${item.directionsUrl}" target="_blank" rel="noopener" class="btn-directions">\u2728 Directions</a>`;
    }
    actions += '</div>';
  }

  let checklist = '';
  if (item.checklist && item.checklist.length) {
    checklist = '<ul class="card-checklist">' +
      item.checklist.map((c) => `<li>${c}</li>`).join('') +
      '</ul>';
  }

  const hasDetails = item.location || item.description || actions || checklist;
  const expandableClass = hasDetails ? ' card-expandable' : '';
  const expandableAttrs = hasDetails ? ' role="button" tabindex="0" aria-expanded="false"' : '';
  const chevron = hasDetails ? '<span class="card-chevron" aria-hidden="true">\u203A</span>' : '';
  const delay = `animation-delay: ${index * 0.06}s`;

  let details = '';
  if (hasDetails) {
    details = '<div class="card-details">';
    if (item.location) details += `<div class="card-location">${item.location}</div>`;
    if (item.description) details += `<div class="card-description">${item.description}</div>`;
    details += checklist + actions + '</div>';
  }

  return `
    <div class="card${expandableClass}" style="${delay}"${expandableAttrs}>
      <div class="card-top">
        <div class="card-icon">${icon}</div>
        <div class="card-info">
          <div class="card-time">${item.time}</div>
          <div class="card-title">${item.title}</div>
        </div>
        ${chevron}
      </div>
      ${details}
    </div>`;
}

function renderDay(day, index) {
  const items = day.items.map((item, i) => renderItem(item, i)).join('');
  const divider = index > 0 ? '<div class="day-divider">\u2729 \u2661 \u2729 \u2661 \u2729</div>' : '';
  return `
    ${divider}
    <section class="day-section">
      <div class="day-header">${day.label}</div>
      ${items}
    </section>`;
}

async function init() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading">\u2728 Loading your kawaii adventure\u2026 \u2728</div>';

  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Failed to load data');
    const data = await res.json();

    const title = data.title || 'My Vacation';
    const subtitle = data.subtitle || '';

    document.querySelector('header h1').textContent = title;
    document.title = title;

    if (subtitle) {
      const subtitleEl = document.createElement('div');
      subtitleEl.className = 'header-subtitle';
      subtitleEl.textContent = subtitle;
      document.querySelector('header').appendChild(subtitleEl);
    }

    const heartsEl = document.createElement('div');
    heartsEl.className = 'header-hearts';
    heartsEl.textContent = '\u2729 \u2661 \u2729 \u2661 \u2729 \u2661 \u2729';
    document.querySelector('header').appendChild(heartsEl);

    app.innerHTML = data.days.map(renderDay).join('');
  } catch (err) {
    app.innerHTML = `<div class="error">Could not load itinerary.<br>${err.message}</div>`;
  }
}

// Delegated click handler for expandable cards
document.getElementById('app').addEventListener('click', (e) => {
  if (e.target.closest('a')) return; // let links work normally
  const card = e.target.closest('.card-expandable');
  if (!card) return;
  const expanded = card.classList.toggle('card-expanded');
  card.setAttribute('aria-expanded', expanded);
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

init();
