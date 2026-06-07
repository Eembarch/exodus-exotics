// ===== AUTH =====
let currentTab = 'fleet';

onAdminAuthChange(user => {
  if (user) showPanel(); else showLogin();
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const pass  = document.getElementById('adminPass').value;
    document.getElementById('loginError').style.display = 'none';
    adminLogin(email, pass).catch(() => {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('adminPass').value = '';
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', adminLogout);
  document.getElementById('addCarBtn').addEventListener('click', () => openModal(null));
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('carForm').addEventListener('submit', saveCar);
  document.getElementById('carModal').addEventListener('click', e => {
    if (e.target === document.getElementById('carModal')) closeModal();
  });

  document.getElementById('tabFleet').addEventListener('click', () => switchTab('fleet'));
  document.getElementById('tabInquiries').addEventListener('click', () => switchTab('inquiries'));

  document.getElementById('fImage').addEventListener('change', previewImage);
});

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display  = 'none';
}

function showPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display  = 'block';
  switchTab('fleet');
}

// Keep whichever tab is open in sync with live fleet data
window.onFleetUpdate = () => { if (currentTab === 'fleet') renderCarList(); };
fleetReady.then(() => { if (currentTab === 'fleet') renderCarList(); });

// ===== TABS =====
function switchTab(tab) {
  currentTab = tab;
  const isFleet = tab === 'fleet';
  document.getElementById('tabFleet').classList.toggle('tab-active', isFleet);
  document.getElementById('tabInquiries').classList.toggle('tab-active', !isFleet);
  document.getElementById('fleetSection').style.display     = isFleet ? 'block' : 'none';
  document.getElementById('inquiriesSection').style.display = isFleet ? 'none'  : 'block';
  if (isFleet) renderCarList(); else renderInquiries();
}

// ===== FLEET TABLE =====
function renderCarList() {
  const fleet    = CARS;
  const tbody    = document.getElementById('carTableBody');
  const countEl  = document.getElementById('fleetCount');
  countEl.textContent = `${fleet.length} vehicle${fleet.length !== 1 ? 's' : ''}`;

  if (!fleet.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No vehicles yet. Add one above.</td></tr>';
    return;
  }

  tbody.innerHTML = fleet.map(car => {
    const thumb = car.image
      ? `<img src="${car.image}" alt="" class="car-thumb" />`
      : `<span style="font-size:1.4rem">${car.emoji || '🚗'}</span>`;
    return `
      <tr>
        <td>
          ${thumb}
          <span class="car-name">${car.year} ${car.make} ${car.model}</span>
          ${car.badge ? `<span class="admin-badge">${car.badge}</span>` : ''}
        </td>
        <td>${car.trim}</td>
        <td>${car.type}</td>
        <td>$${car.price.toLocaleString()}/day</td>
        <td class="action-cell">
          <button class="admin-btn edit-btn" onclick="editCar(${car.id})">Edit</button>
          <button class="admin-btn delete-btn" onclick="deleteCar(${car.id})">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

// ===== INQUIRIES TABLE =====
async function renderInquiries() {
  const list  = await getInquiries();
  const tbody = document.getElementById('inquiryTableBody');
  const countEl = document.getElementById('inquiryCount');
  countEl.textContent = `${list.length} ${list.length !== 1 ? 'inquiries' : 'inquiry'}`;

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No inquiries yet.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(inq => {
    const date = new Date(inq.submittedAt).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
    const dates = (inq.startDate && inq.endDate)
      ? `${inq.startDate} → ${inq.endDate}`
      : '—';
    const typeBadge = inq.type === 'reservation'
      ? `<span class="admin-badge" style="border-color:rgba(100,180,100,0.4);color:#6fcf97;background:rgba(39,174,96,0.08)">Reservation</span>`
      : `<span class="admin-badge">Inquiry</span>`;
    return `
      <tr>
        <td>${typeBadge} ${inq.name}</td>
        <td style="font-size:0.8rem">${inq.email}<br><span style="color:#555">${inq.phone || '—'}</span></td>
        <td>${inq.vehicle || '—'}</td>
        <td style="font-size:0.8rem">${dates}</td>
        <td style="font-size:0.8rem;color:#777;max-width:180px">${inq.notes || '—'}</td>
        <td style="font-size:0.75rem;color:#444;white-space:nowrap">
          ${date}
          <br><button class="admin-btn delete-btn" style="margin-top:0.35rem" onclick="confirmDeleteInquiry(${inq.id})">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

async function confirmDeleteInquiry(id) {
  if (!confirm('Delete this inquiry?')) return;
  await deleteInquiry(id);
  renderInquiries();
}

// ===== MODAL =====
function openModal(car) {
  document.getElementById('modalTitle').textContent = car ? 'Edit Vehicle' : 'Add Vehicle';
  document.getElementById('imgPreviewWrap').style.display = 'none';
  document.getElementById('fImage').value = '';

  if (car) {
    document.getElementById('carId').value          = car.id;
    document.getElementById('fYear').value          = car.year;
    document.getElementById('fMake').value          = car.make;
    document.getElementById('fModel').value         = car.model;
    document.getElementById('fTrim').value          = car.trim;
    document.getElementById('fType').value          = car.type;
    document.getElementById('fColor').value         = car.color;
    document.getElementById('fPrice').value         = car.price;
    document.getElementById('fMileage').value       = car.mileage;
    document.getElementById('fEngine').value        = car.engine;
    document.getElementById('fTransmission').value  = car.transmission;
    document.getElementById('fMpg').value           = car.mpg;
    document.getElementById('fDoors').value         = car.doors;
    document.getElementById('fBadge').value         = car.badge || '';
    document.getElementById('fFeatures').value      = car.features.join('\n');
    document.getElementById('fDescription').value   = car.description;
    if (car.image) {
      document.getElementById('imgPreview').src       = car.image;
      document.getElementById('imgPreviewWrap').style.display = 'block';
    }
  } else {
    document.getElementById('carForm').reset();
    document.getElementById('carId').value  = '';
    document.getElementById('fDoors').value = '2';
  }

  document.getElementById('carModal').style.display = 'flex';
  document.getElementById('fYear').focus();
}

function closeModal() {
  document.getElementById('carModal').style.display = 'none';
}

// Resizes and compresses an uploaded photo so it stays well under Firestore's 1MB document limit
function compressImage(file, maxWidth = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale  = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function previewImage() {
  const file = document.getElementById('fImage').files[0];
  if (!file) return;
  const dataUrl = await compressImage(file);
  document.getElementById('imgPreview').src = dataUrl;
  document.getElementById('imgPreviewWrap').style.display = 'block';
}

// ===== CRUD =====
function editCar(id) {
  const car = CARS.find(c => c.id === id);
  if (car) openModal(car);
}

async function deleteCar(id) {
  const car = CARS.find(c => c.id === id);
  if (!car || !confirm(`Remove the ${car.year} ${car.make} ${car.model} from the fleet?`)) return;
  await deleteFleetCar(id);
}

async function saveCar(e) {
  e.preventDefault();
  const existingId = document.getElementById('carId').value;
  const existing   = existingId ? CARS.find(c => c.id === parseInt(existingId)) : null;

  const typeVal  = document.getElementById('fType').value;
  const emojiMap = { Coupe: '🏎️', Sedan: '🚗', SUV: '🚙', Convertible: '🏎️', Truck: '🚙' };

  const carData = {
    id:           existingId ? parseInt(existingId) : Date.now(),
    order:        existing ? (existing.order ?? Date.now()) : Date.now(),
    year:         parseInt(document.getElementById('fYear').value),
    make:         document.getElementById('fMake').value.trim(),
    model:        document.getElementById('fModel').value.trim(),
    trim:         document.getElementById('fTrim').value.trim(),
    type:         typeVal,
    color:        document.getElementById('fColor').value.trim(),
    price:        parseInt(document.getElementById('fPrice').value),
    mileage:      parseInt(document.getElementById('fMileage').value),
    engine:       document.getElementById('fEngine').value.trim(),
    transmission: document.getElementById('fTransmission').value.trim(),
    mpg:          document.getElementById('fMpg').value.trim(),
    doors:        parseInt(document.getElementById('fDoors').value),
    badge:        document.getElementById('fBadge').value.trim() || null,
    emoji:        emojiMap[typeVal] || '🚗',
    features:     document.getElementById('fFeatures').value.split('\n').map(f => f.trim()).filter(Boolean),
    description:  document.getElementById('fDescription').value.trim(),
    image:        existing ? (existing.image || null) : null,
  };

  const file = document.getElementById('fImage').files[0];
  if (file) {
    carData.image = await compressImage(file);
  }

  await saveFleetCar(carData);
  closeModal();
}
