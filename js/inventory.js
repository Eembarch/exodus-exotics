// ===== INVENTORY PAGE =====

document.getElementById('navToggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

function carCardHTML(car) {
  const price   = car.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const mileage = car.mileage.toLocaleString();
  const badge   = car.badge ? `<span class="car-badge">${car.badge}</span>` : '';
  const imgInner = car.image
    ? `<img src="${car.image}" alt="${car.make} ${car.model}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
    : (car.emoji || '🚗');
  const imgStyle = car.image ? 'style="padding:0;font-size:0;"' : '';
  return `
    <div class="car-card" onclick="window.location='/car/?id=${car.id}'">
      <div class="car-img-wrap">
        <div class="car-img" ${imgStyle}>${imgInner}</div>
        ${badge}
      </div>
      <div class="car-body">
        <div class="car-title">${car.year} ${car.make} ${car.model}</div>
        <div class="car-sub">${car.trim} &bull; ${car.color}</div>
        <div class="car-specs">
          <span>&#9881; ${car.engine}</span>
          <span>&#128246; ${car.transmission}</span>
        </div>
        <div class="car-price">${price}<span class="per-day">/day</span></div>
        <div class="car-price-note">${mileage} miles &bull; ${car.type}</div>
      </div>
      <div class="car-footer">
        <span style="font-size:0.75rem;color:var(--gray);letter-spacing:1px;text-transform:uppercase">${car.make}</span>
        <a href="/car/?id=${car.id}" class="btn btn-primary">Reserve</a>
      </div>
    </div>
  `;
}

function renderInventory() {
  const sort    = document.getElementById('sortBy').value;
  const grid    = document.getElementById('inventoryGrid');
  const count   = document.getElementById('resultsCount');
  let results   = [...CARS];

  switch (sort) {
    case 'price-asc':   results.sort((a,b) => a.price - b.price); break;
    case 'price-desc':  results.sort((a,b) => b.price - a.price); break;
    case 'year-desc':   results.sort((a,b) => b.year - a.year); break;
    case 'mileage-asc': results.sort((a,b) => a.mileage - b.mileage); break;
  }

  count.textContent = `${results.length} vehicle${results.length !== 1 ? 's' : ''} available`;
  grid.innerHTML = results.length
    ? results.map(car => carCardHTML(car)).join('')
    : '<div class="no-results">No vehicles in the fleet yet.</div>';
}

document.getElementById('sortBy').addEventListener('change', renderInventory);
renderInventory();
