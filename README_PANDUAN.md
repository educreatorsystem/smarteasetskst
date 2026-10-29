# SMART e-ASET — SK Sungai Tiram

Pakej statik untuk GitHub Pages. Paparan moden, hover, grafik ringkasan, logo sekolah, QR, PWA, cetakan A4, CSV dan sandaran JSON. Tiada npm atau build diperlukan.

## 1. Muat naik ke GitHub Pages

1. Ekstrak ZIP.
2. Muat naik **kandungan folder ini** ke akar repositori GitHub. `index.html` mesti berada di akar repositori, bukan di dalam satu lagi folder.
3. Kekalkan folder `icons` dan `vendor` beserta semua failnya.
4. GitHub → Settings → Pages → Deploy from a branch → main → / (root) → Save.
5. Buka URL HTTPS yang GitHub paparkan selepas deployment selesai.

Fail web: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `.nojekyll`, folder `icons` dan `vendor`.
`Code.gs` dan panduan ini boleh kekal dalam repositori; tiada kata laluan disertakan dalam kod.

## 2. Aktifkan pangkalan data sebenar — wajib sebelum log masuk

Aplikasi menggunakan Sheet ID:
`1Io5vxJLqW3ezIH3y37ugp77LGYqmaBvPQqQQv51C0ZI`

URL Apps Script asal telah diisi dalam aplikasi. Respons asal belum dapat disahkan sebagai API yang sepadan. Sambungan sebenar memerlukan kod `Code.gs` dalam pakej ini. CSV asal hanya disediakan sebagai pautan rujukan dalam Tetapan; aplikasi TIDAK menganggap CSV awam sebagai pangkalan data terlindung.

1. Buka Google Sheet tersebut sebagai pemilik / editor.
2. Extensions → Apps Script.
3. Sandarkan kod Apps Script sedia ada sebelum menggantikannya. Jika skrip asal digunakan oleh aplikasi lain, **cipta projek Apps Script berasingan** untuk e-ASET supaya aplikasi lain tidak terganggu.
4. Salin keseluruhan kandungan `Code.gs` ke projek yang dipilih dan simpan.
5. Project Settings → Script properties → Add script property. Masukkan:
   - `ADMIN_USERNAME`: nama pengguna pilihan sendiri, 3–60 aksara (huruf, nombor, titik, sengkang atau underscore).
   - `ADMIN_PASSWORD`: kata laluan pilihan sendiri, sekurang-kurangnya 10 aksara.
   - `ADMIN_NAME`: nama admin, contohnya Admin SK Sungai Tiram.
6. Pilih fungsi `setup` dan tekan Run. Berikan kebenaran Google yang diperlukan. Jalankan sekali sahaja. Kata laluan awal dibuang daripada Script properties selepas akaun disediakan; rekod akaun menyimpan hash berserta salt.
7. `setup()` mencipta tab `EASET_ASSETS`, `EASET_LOCATIONS`, `EASET_LOANS`, `EASET_MAINTENANCE`, `EASET_MOVES` dan `EASET_USERS`. Ia tidak memadam tab asal dan tidak mengimport struktur CSV lama secara automatik.
8. Deploy → New deployment → Web app → Execute as **Me** → Who has access **Anyone** → Deploy.
9. Jika menggunakan deployment lama: Deploy → Manage deployments → Edit → Version **New version** → Deploy. Cara ini lazimnya mengekalkan URL /exec sedia ada.
10. Salin URL sebenar yang berakhir `/exec`. Dalam aplikasi → Tetapan → tampal URL → Simpan URL → Log masuk.
11. Jika URL asal dikekalkan, tidak perlu URL baharu. Jika projek baharu dibuat, Google menjana URL baharu selepas deployment; tiada URL baharu direka dalam pakej ini.

**Penting:** Polisi akaun Google Workspace sekolah mungkin tidak membenarkan akses Web App kepada Anyone. Jika pilihan ini tiada, pentadbir domain perlu menentukan kaedah akses yang sesuai. Aplikasi GitHub Pages ini memerlukan endpoint yang boleh dicapai pelayar, dengan log masuk aplikasi untuk data.

## 3. Cuba aplikasi tanpa sambungan

Tetapan → Buka Mod Demo. Terdapat 12 rekod rekaan. Data teks demo disimpan pada peranti ini sahaja. Data contoh tidak dihantar ke Google Sheet. Log masuk atau keluar tidak memadam sandaran demo. Muat naik gambar sebenar memerlukan backend; dalam demo gunakan URL gambar HTTPS.

## 4. Pengguna dan aliran kerja

- Admin: daftar/edit/arkib/pulihkan aset, lokasi, pergerakan, kelulusan pinjaman, pemulangan, penyelenggaraan, laporan dan pengguna.
- Guru: lihat inventori terhad, mohon pinjaman dan hantar aduan. Hanya rekod permohonan/aduan sendiri dipulangkan oleh pelayan. Data harga, pembekal dan pegawai tidak dihantar kepada guru.
- Akaun guru dicipta oleh admin dalam Tetapan → Pengguna. Jangan cipta akaun demo untuk data sebenar.
- Token sesi disimpan dalam memori pelayar, bukan dalam URL atau localStorage; muat semula halaman memerlukan log masuk semula. Sesi pelayan maksimum 6 jam dan boleh tamat lebih awal mengikut cache Google.
- Pinjaman guru perlu diluluskan admin. Aset diperiksa semula di pelayan ketika kelulusan. Pemulangan merekod keadaan dan tarikh sebenar.
- Nombor daftar unik bagi setiap unit aset; pindah lokasi melalui tab Lokasi & Pergerakan.
- Aset tidak boleh diarkibkan ketika mempunyai pinjaman/permohonan atau penyelenggaraan terbuka.
- Sistem ini menggunakan Google Sheets untuk beban penggunaan sekolah yang sederhana. Transaksi ditulis di bawah kunci skrip. Sandarkan data berkala.

## 5. Gambar dan QR

Lencana sekolah telah dimuat turun daripada pautan yang diberi dan dimasukkan dalam `icons`.

Admin boleh memasukkan URL HTTPS atau memuat naik gambar PNG/JPG/WebP sehingga 3 MB. Muat naik mencipta folder Drive `SMART e-ASET SKST Gambar` dan menjadikan fail gambar boleh dilihat oleh sesiapa yang mempunyai pautan, supaya ia boleh dipaparkan dari GitHub Pages. Gunakan gambar aset yang sesuai dikongsi. Jika sekolah menyekat perkongsian Drive, gunakan URL imej yang dibenarkan. Gambar tidak disimpan dalam localStorage.

QR mengandungi URL GitHub Pages dan ID aset sahaja. Selepas imbas, pengguna perlu log masuk untuk melihat aset. Sediakan sambungan pangkalan data yang sama pada peranti pengimbas melalui Tetapan. Jangan cetak label semasa membuka fail melalui `file://` kerana URL itu tidak boleh digunakan pada peranti lain.

## 6. Pasang PWA

- Android / Chrome / Edge: buka laman HTTPS → butang Pasang aplikasi jika tersedia, atau menu pelayar → Install app.
- iPhone / iPad Safari: Share → Add to Home Screen.
- Ikon menggunakan lencana sekolah dengan ruang selamat untuk maskable icon.
- Rangka aplikasi tersedia di luar talian selepas lawatan pertama. Data sebenar dan simpanan Google Sheets memerlukan internet. Tiada antrean simpanan luar talian yang mendakwa rekod telah disimpan.
- Fon Google memerlukan internet; fon sistem menjadi pengganti apabila luar talian.
- Selepas mengemas kini fail web, naikkan versi CACHE dalam `sw.js` untuk menggantikan cache lama. Tutup dan buka semula aplikasi jika masih memaparkan versi lama.

## 7. Laporan dan sandaran

Laporan → pilih jenis / lokasi → Cetak / PDF A4 → pilih Save as PDF dalam dialog cetak pelayar. Eksport CSV menyertakan BOM UTF-8 untuk Excel dan mengelakkan formula daripada input teks.

Tetapan → Eksport sandaran menyimpan JSON rekod yang dibenarkan bagi akaun semasa. Import JSON hanya untuk Mod Demo, selepas pengesahan struktur dan pengesahan pengguna. Import tidak menulis data pukal ke Sheet sebenar.

Laporan ialah pengurusan dalaman, bukan borang rasmi kerajaan.

## 8. Semakan sebelum penggunaan sebenar

1. Login admin dan tambah satu aset ujian (mulakan dengan lokasi sedia ada).
2. Muat semula, login semula dan sahkan rekod masih wujud.
3. Cipta akaun guru, mohon pinjaman. Login admin, luluskan, kemudian pulangkan.
4. Rekod kerosakan dan selesaikan penyelenggaraan.
5. Uji cetakan, QR dan pemasangan PWA menggunakan URL GitHub Pages sebenar.

Kod dan aliran demo telah disemak setempat. Sambungan tulis sebenar, kebenaran Workspace, pemasangan PWA dan pembacaan QR pada domain GitHub akhir perlu disahkan selepas deployment. Fail ini tidak menerbitkan laman atau mengubah Apps Script secara automatik.

## 9. Jika ada masalah

- Respons bukan JSON: semak URL /exec, deploy versi baharu, Execute as Me dan akses Anyone.
- Medan / tab tiada: jalankan setup sekali dengan Script properties lengkap.
- Login gagal: gunakan nama pengguna/kata laluan yang ditetapkan, bukan kata laluan Google. Selepas banyak cubaan salah, tunggu 10 minit.
- Simpan gagal / timeout: jangan terus ulang; segar semula dahulu untuk menyemak sama ada rekod telah diterima, kemudian cuba semula jika belum wujud.
- Tiada rekod: data asal dalam tab lain tidak dipindahkan secara automatik. Skema asal CSV belum disahkan.
- Elakkan Publish to web bagi tab EASET_USERS atau tab yang mengandungi data sensitif. URL CSV awam sedia ada tidak memberi perlindungan akses terhadap data yang diterbitkan.

## Komponen pihak ketiga

`vendor/qrcode.js`: QRCode.js oleh davidshimjs (MIT). Kod QR dijana dalam pelayar, tidak dihantar kepada servis QR luar. Lihat THIRD_PARTY_NOTICES.txt.
