# 07 — Panduan VulnShop
- `/` daftar produk, `/search?q=` pencarian, `/product/<id>` detail + komentar, `/login` masuk.
- Akun demo (lab): `demo` / `demo12345`.
- Event yang dikirim ke SOC: `login_failed`, `login_success`, `search`, `comment`, `http_error` (4xx/5xx).
- Password, cookie, dan body mentah **tidak** dikirim ke SOC.
- Mode aman: SQL berparameter, output di-escape (EJS). Payload serangan tampil sebagai teks biasa dan dicatat sebagai alert.
