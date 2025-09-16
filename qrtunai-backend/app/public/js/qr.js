
// QR rotasi otomatis dan fetch dari backend, fallback QR generator jika backend belum sediakan gambar
const qrImg = document.getElementById('qr-img');
const qrTtl = document.getElementById('qr-ttl');
let timer = null;

async function fetchQR() {
  try {
    const res = await fetch('/api/qr', { method: 'POST' });
    const data = await res.json();
    // Coba fetch gambar QR dari backend, jika gagal generate QR di frontend
    if (data.id) {
      // Coba fetch gambar dari backend
      fetch(`/api/qr-img/${data.id}`).then(r => {
        if (r.ok) {
          qrImg.src = `/api/qr-img/${data.id}`;
        } else {
          // Fallback: generate QR di frontend
          QRCode.toDataURL(data.id, { width: 192, margin: 2 }, (err, url) => {
            qrImg.src = url;
          });
        }
      }).catch(() => {
        QRCode.toDataURL(data.id, { width: 192, margin: 2 }, (err, url) => {
          qrImg.src = url;
        });
      });
    }
    let ttl = data.expiresIn || 120;
    qrTtl.textContent = ttl;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      ttl--;
      qrTtl.textContent = ttl;
      if (ttl <= 0) {
        clearInterval(timer);
        fetchQR();
      }
    }, 1000);
  } catch (e) {
    qrTtl.textContent = 'ERR';
  }
}

if (qrImg && qrTtl) fetchQR();
