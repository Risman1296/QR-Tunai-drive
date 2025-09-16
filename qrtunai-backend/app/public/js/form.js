
// Submit form transaksi ke backend, validasi token, dan proteksi refresh
const form = document.getElementById('trx-form');
const statusDiv = document.getElementById('form-status');

// Ambil token dari URL (bukan manual, harus dari QR)
const urlParams = new URLSearchParams(window.location.search);
const tokenId = urlParams.get('id') || '';

// Bind sessionStorage agar token hanya bisa dipakai sekali per device/session
const SESSION_KEY = 'qrtunai_token_id';

async function validateToken() {
  if (!tokenId) return false;
  // Cek ke backend apakah token valid dan belum pernah dipakai di session ini
  if (sessionStorage.getItem(SESSION_KEY) === tokenId) {
    return true;
  }
  const res = await fetch(`/api/t/${tokenId}`);
  const data = await res.json();
  if (res.ok && data.valid) {
    // Bind session agar token tidak bisa di-refresh manual
    await fetch(`/api/t/${tokenId}/notify-view`, { method: 'POST' });
    sessionStorage.setItem(SESSION_KEY, tokenId);
    return true;
  }
  return false;
}

async function initForm() {
  const valid = await validateToken();
  if (!valid) {
    statusDiv.textContent = 'Token tidak valid atau sudah dipakai. Silakan scan QR ulang.';
    form.style.display = 'none';
    setTimeout(() => { window.location.href = '/qr.html'; }, 2000);
    return;
  }
  // Proteksi refresh: jika token sudah di session, tetap izinkan, tapi jika token berubah, redirect
  if (sessionStorage.getItem(SESSION_KEY) !== tokenId) {
    window.location.href = '/qr.html';
    return;
  }
}

if (form) {
  initForm();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.textContent = '';
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    // Kirim evidence jika ada
    let evidenceUrl = '';
    if (fd.get('evidence') && fd.get('evidence').size > 0) {
      const up = new FormData();
      up.append('evidence', fd.get('evidence'));
      const resUp = await fetch('/api/upload/evidence', { method: 'POST', body: up });
      const upData = await resUp.json();
      evidenceUrl = upData.path;
    }
    data.evidence_url = evidenceUrl;
    // Kirim data transaksi
    const res = await fetch(`/api/t/${tokenId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
      statusDiv.textContent = 'Transaksi berhasil dikirim. Terima kasih.';
      sessionStorage.removeItem(SESSION_KEY);
      setTimeout(() => {
        window.location.href = '/social.html';
      }, 1500);
    } else {
      statusDiv.textContent = result.errors ? result.errors.join(', ') : 'Gagal mengirim.';
    }
  });
}
