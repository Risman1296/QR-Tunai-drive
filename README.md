# Proyek QR Tunai Drive

Ini adalah aplikasi Next.js untuk sistem transaksi drive-thru.

---

## CARA DEPLOY KE SERVER UBUNTU ANDA

Ikuti langkah-langkah ini dengan tepat untuk men-deploy aplikasi ini.

### LANGKAH 1: Unggah Kode ini ke GitHub (Dilakukan di Komputer Lokal Anda)

**Penting:** Jalankan semua perintah di bawah ini di terminal komputer lokal Anda (CMD, PowerShell, Terminal), **BUKAN** di server Ubuntu.

1.  **Unduh Proyek Ini:** Pastikan semua file proyek ini (termasuk file `README.md` ini) ada di sebuah folder di komputer Anda.

2.  **Buka Terminal di Folder Proyek:** Gunakan `cd` untuk masuk ke folder proyek tersebut.

3.  **Buat Personal Access Token (PAT) di GitHub:**
    *   Buka [halaman token GitHub](https://github.com/settings/tokens/new).
    *   **Note:** Beri nama token (misalnya, `deploy-token`).
    *   **Expiration:** Pilih durasi (misalnya, 30 hari).
    *   **Scopes:** Centang kotak `repo`.
    *   Klik **Generate token** dan **SALIN** token yang muncul. Simpan di tempat aman.

4.  **Jalankan Perintah Git Berikut Satu per Satu:**

    ```bash
    # Setel identitas Git Anda (ganti dengan nama dan email GitHub Anda)
    git config --global user.name "Risman"
    git config --global user.email "emailanda@example.com"

    # Inisialisasi dan unggah proyek
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/Risman1296/QR-Tunai-drive.git
    git push -u origin main
    ```

5.  **Saat Diminta Kredensial:**
    *   **Username:** `Risman1296`
    *   **Password:** **PASTE (tempel) PERSONAL ACCESS TOKEN** yang telah Anda salin. **JANGAN GUNAKAN PASSWORD GITHUB ANDA.**

Setelah berhasil, periksa halaman repositori GitHub Anda. Seharusnya sekarang sudah terisi dengan semua file proyek.

---

### LANGKAH 2: Deploy di Server Ubuntu (Dilakukan di Server Anda)

Setelah repositori GitHub Anda terisi, barulah Anda bisa masuk ke server Ubuntu Anda dan jalankan perintah berikut.

1.  **Masuk ke Server Ubuntu Anda via SSH.**

2.  **Bersihkan Instalasi Sebelumnya (jika ada):**
    ```bash
    cd ~
    rm -rf QR-Tunai-drive
    ```

3.  **Clone Repositori yang Sudah Terisi:**
    ```bash
    git clone https://github.com/Risman1296/QR-Tunai-drive.git
    ```

4.  **Masuk ke Folder Proyek:**
    ```bash
    cd QR-Tunai-drive
    ```

5.  **Install Node.js, npm, dan PM2 (jika belum):**
    ```bash
    sudo apt update
    sudo apt install nodejs npm -y
    sudo npm install pm2 -g
    ```

6.  **Install Dependensi Proyek:**
    ```bash
    npm install
    ```

7.  **Buat File Environment Variable:**
    ```bash
    nano .env.local
    ```
    Isi file dengan API Key Anda:
    ```
    GEMINI_API_KEY=MASUKKAN_KUNCI_API_GEMINI_ANDA_DI_SINI
    ```
    Simpan (`Ctrl+X`, `Y`, `Enter`).

8.  **Build dan Jalankan Aplikasi:**
    ```bash
    npm run build
    pm2 start npm --name "qr-tunai-drive" -- start
    pm2 startup
    pm2 save
    ```

Aplikasi Anda sekarang seharusnya sudah berjalan. Anda bisa memeriksanya dengan `pm2 status`.
