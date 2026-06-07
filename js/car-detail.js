// ===== CAR DETAIL PAGE =====

document.getElementById('navToggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

const params  = new URLSearchParams(window.location.search);
const carId   = parseInt(params.get('id'));
const section = document.getElementById('carDetail');

function renderCarDetail() {
  const car = CARS.find(c => c.id === carId);

  if (!car) {
    section.innerHTML = '<p class="loading">Vehicle not found. <a href="/inventory/">Back to fleet</a></p>';
    const simSection = document.getElementById('similarGrid');
    if (simSection) simSection.parentElement.style.display = 'none';
    return;
  }

  document.title = `${car.year} ${car.make} ${car.model} | Exodus Exotics`;

  const price      = car.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const mileage    = car.mileage.toLocaleString();
  const weeklyRate = (car.price * 6).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const featuresHTML = car.features.map(f => `<span class="feature-tag">${f}</span>`).join('');
  const badgeHTML  = car.badge ? `<span class="car-badge" style="position:static;display:inline-block;margin-bottom:0.8rem">${car.badge}</span>` : '';

  const mainImgContent = car.image
    ? `<img src="${car.image}" alt="${car.make} ${car.model}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);" />`
    : (car.emoji || '🚗');
  const mainImgStyle = car.image ? 'style="padding:0;overflow:hidden;"' : '';

  section.innerHTML = `
    <div class="detail-layout">
      <div class="detail-main">
        <div class="detail-main-img" ${mainImgStyle}>${mainImgContent}</div>
        ${badgeHTML}
        <h1 class="detail-title">${car.year} ${car.make} ${car.model}</h1>
        <div class="detail-sub">${car.trim} &bull; ${car.color}</div>
        <div class="detail-price">${price}<span style="font-size:1.1rem;font-weight:400;color:var(--gray);margin-left:4px">/day</span></div>
        <div style="color:#555;font-size:0.8rem;margin-bottom:1.2rem;letter-spacing:0.5px">Weekly rate from ${weeklyRate} &bull; Long-term rates available</div>

        <div class="detail-specs-grid">
          <div class="spec-item"><div class="spec-label">Mileage</div><div class="spec-value">${mileage} mi</div></div>
          <div class="spec-item"><div class="spec-label">Body Type</div><div class="spec-value">${car.type}</div></div>
          <div class="spec-item"><div class="spec-label">Engine</div><div class="spec-value">${car.engine}</div></div>
          <div class="spec-item"><div class="spec-label">Transmission</div><div class="spec-value">${car.transmission}</div></div>
          <div class="spec-item"><div class="spec-label">Fuel Economy</div><div class="spec-value">${car.mpg} MPG</div></div>
          <div class="spec-item"><div class="spec-label">Doors</div><div class="spec-value">${car.doors}</div></div>
          <div class="spec-item"><div class="spec-label">Color</div><div class="spec-value">${car.color}</div></div>
          <div class="spec-item"><div class="spec-label">Year</div><div class="spec-value">${car.year}</div></div>
        </div>

        <p style="color:#666;line-height:1.85;margin-bottom:1.5rem;font-size:0.92rem">${car.description}</p>

        <div class="detail-features">
          <h3>Features &amp; Highlights</h3>
          <div class="features-list">${featuresHTML}</div>
        </div>
      </div>

      <div class="detail-sidebar">
        <div class="sidebar-card">
          <h3>Reserve This Vehicle</h3>
          <a href="/financing/" class="btn btn-primary full-width">Check Availability &amp; Rates</a>
          <a href="/contact/" class="btn btn-outline full-width" style="margin-bottom:1.5rem">Contact Our Concierge</a>

          <form id="inquiryForm" class="contact-form">
            <div class="form-group">
              <label for="iName">Your Name</label>
              <input type="text" id="iName" placeholder="John Smith" required />
            </div>
            <div class="form-group">
              <label for="iEmail">Email</label>
              <input type="email" id="iEmail" placeholder="john@example.com" required />
            </div>
            <div class="form-group">
              <label for="iPhone">Phone</label>
              <input type="tel" id="iPhone" placeholder="(555) 000-0000" />
            </div>
            <div class="form-group">
              <label for="iMsg">Message</label>
              <textarea id="iMsg" rows="3" placeholder="Dates, duration, any special requests..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary full-width">Send Inquiry</button>
          </form>
          <div id="inquirySuccess" class="success-msg" style="display:none;">
            Thank you! Our concierge will contact you shortly about the ${car.year} ${car.make} ${car.model}.
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('inquiryForm').addEventListener('submit', e => {
    e.preventDefault();
    saveInquiry({
      type:      'inquiry',
      vehicle:   `${car.year} ${car.make} ${car.model} ${car.trim}`,
      vehicleId: car.id,
      name:      document.getElementById('iName').value.trim(),
      email:     document.getElementById('iEmail').value.trim(),
      phone:     document.getElementById('iPhone').value.trim(),
      startDate: '',
      endDate:   '',
      notes:     document.getElementById('iMsg').value.trim(),
    });
    document.getElementById('inquiryForm').style.display = 'none';
    document.getElementById('inquirySuccess').style.display = 'block';
  });

  // Similar vehicles
  const similar  = CARS.filter(c => c.type === car.type && c.id !== car.id).slice(0, 3);
  const simGrid  = document.getElementById('similarGrid');
  if (similar.length > 0) {
    simGrid.parentElement.style.display = '';
    simGrid.innerHTML = similar.map(c => {
      const p     = c.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
      const badge = c.badge ? `<span class="car-badge">${c.badge}</span>` : '';
      const imgInner = c.image
        ? `<img src="${c.image}" alt="${c.make} ${c.model}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
        : (c.emoji || '🚗');
      const imgStyle = c.image ? 'style="padding:0;font-size:0;"' : '';
      return `
        <div class="car-card" onclick="window.location='/car/?id=${c.id}'">
          <div class="car-img-wrap">
            <div class="car-img" ${imgStyle}>${imgInner}</div>
            ${badge}
          </div>
          <div class="car-body">
            <div class="car-title">${c.year} ${c.make} ${c.model}</div>
            <div class="car-sub">${c.trim}</div>
            <div class="car-price">${p}<span class="per-day">/day</span></div>
          </div>
          <div class="car-footer">
            <span style="font-size:0.75rem;color:var(--gray);letter-spacing:1px;text-transform:uppercase">${c.make}</span>
            <a href="/car/?id=${c.id}" class="btn btn-primary">Reserve</a>
          </div>
        </div>
      `;
    }).join('');
  } else {
    simGrid.parentElement.style.display = 'none';
  }
}

window.onFleetUpdate = renderCarDetail;
fleetReady.then(renderCarDetail);
