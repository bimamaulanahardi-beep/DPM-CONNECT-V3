# Panduan Deploy & Pengamanan DPM Connect ITB Riau (Production-Ready)

Panduan ini ditujukan bagi tim IT / Administrator Kampus ITB Riau untuk mendeploy aplikasi **DPM Connect** ke server produksi (VPS atau Cloud Hosting) secara aman.

---

## 1. Persiapan Environment Variables (PENTING)

Sebelum menjalankan aplikasi di server produksi, Anda harus mengubah konfigurasi file `.env.local` (atau setel langsung di env server VPS/hosting):

* **`NEXTAUTH_URL`**: Ubah dari `http://localhost:3000` ke domain resmi kampus.
  * *Contoh*: `https://dpm.itbriau.ac.id` (Wajib menggunakan `https://`).
* **`NEXTAUTH_SECRET`**: Ganti dengan string acak berkeamanan tinggi (minimal 32 karakter).
  * *Cara Generate di Terminal*: `openssl rand -base64 32`
* **`PORT`**: Port default adalah `3000`. Jika menggunakan port lain, sesuaikan di reverse proxy.

---

## 2. Pilihan Database Produksi

Aplikasi ini menggunakan Prisma ORM yang mendukung banyak database. Ada dua pilihan untuk produksi:

### Pilihan A: Menggunakan SQLite (Default - Praktis)
Cocok jika dideploy ke **VPS tunggal** dengan perkiraan lalu lintas data kecil hingga sedang.
* Database tersimpan di file tunggal `/prisma/dev.db`.
* **Rekomendasi Keamanan**: Backup file `dev.db` ini secara otomatis setiap hari menggunakan cron job.

### Pilihan B: Menggunakan PostgreSQL / MySQL (Sangat Direkomendasikan)
Cocok jika dideploy ke infrastruktur cloud serverless (seperti Vercel) atau database terpisah demi performa tinggi dan skalabilitas.

**Langkah migrasi database:**
1. Buka file [schema.prisma](file:///d:/DPM%20ITB%20RIAU%20V2.0/prisma/schema.prisma) dan ubah bagian `datasource db`:
   ```prisma
   datasource db {
     provider = "postgresql" // ganti dengan "mysql" atau "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Tambahkan variabel `DATABASE_URL` di file `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dpm_db?schema=public"
   ```
3. Jalankan perintah migrasi di server:
   ```bash
   npx prisma migrate deploy
   ```
4. Jalankan script seeding untuk data awal:
   ```bash
   node prisma/seed.js
   ```

---

## 3. Deploy di VPS Linux (Ubuntu Server) dengan PM2 & Nginx

Metode ini adalah cara paling umum dan aman untuk menghosting aplikasi Next.js secara mandiri.

### Langkah 1: Install Node.js, PM2, dan Nginx
```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager) secara global
sudo npm install pm2 -g

# Install Nginx
sudo apt install nginx -y
```

### Langkah 2: Build & Start Aplikasi
1. Upload folder proyek ke VPS (misalnya ke `/var/www/dpm-connect`).
2. Masuk ke direktori proyek dan jalankan:
   ```bash
   npm install --production
   npx prisma generate
   npm run build
   ```
3. Jalankan aplikasi menggunakan PM2 agar tetap aktif di latar belakang:
   ```bash
   pm2 start npm --name "dpm-connect" -- start
   pm2 save
   pm2 startup
   ```

### Langkah 3: Konfigurasi Nginx Reverse Proxy & HTTP Headers
Nginx akan menerima traffic dari luar pada port 80/443 dan meneruskannya ke port 3000 (aplikasi Next.js).
1. Buat file konfigurasi Nginx baru:
   ```bash
   sudo nano /etc/nginx/sites-available/dpm-connect
   ```
2. Salin konfigurasi di bawah ini (ganti `domain_anda.com` dengan domain resmi):
   ```nginx
   server {
       listen 80;
       server_name domain_anda.com www.domain_anda.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Aktifkan konfigurasi dan restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dpm-connect /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 4. Keamanan Server Tambahan (Wajib)

### A. Aktifkan Let's Encrypt SSL (HTTPS)
Jangan pernah mengirim data NIM dan password melalui jaringan HTTP biasa. Aktifkan SSL secara gratis:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domain_anda.com -d www.domain_anda.com
```
*Certbot akan secara otomatis mengonfigurasi Nginx untuk mengalihkan semua traffic HTTP ke HTTPS secara aman.*

### B. Konfigurasi Firewall (UFW)
Hanya buka port yang benar-benar diperlukan oleh server produksi Anda:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh          # Port 22
sudo ufw allow 'Nginx Full' # Port 80 & 443
sudo ufw enable
```

### C. Pembatasan Upload Maksimal di Nginx
Untuk mencegah serangan *Denial of Service (DoS)* melalui unggahan berkas raksasa, batasi ukuran unggahan berkas di `/etc/nginx/nginx.conf` di dalam blok `http`:
```nginx
client_max_body_size 10M; # Maksimal file upload 10 Megabyte
```

---

## 5. Keamanan Aplikasi Internal yang Sudah Terintegrasi
* **X-Frame-Options: DENY**: Mencegah aplikasi direndering di dalam `iframe` situs lain (melindungi dari serangan Clickjacking).
* **X-Content-Type-Options: nosniff**: Menghindari browser menebak-nebak tipe file, mencegah pengeksekusian script berbahaya bermodus file gambar.
* **Strict-Transport-Security (HSTS)**: Memaksa browser hanya berkomunikasi menggunakan HTTPS.
* **Referrer-Policy**: Mengatur informasi header rujukan agar data internal tidak bocor ke luar saat berpindah link.
* **Session JWT Signed**: Seluruh token login pengguna ditandatangani secara kriptografis menggunakan algoritma SHA-256.
