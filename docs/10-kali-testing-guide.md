# 10 — Panduan Pengujian dari Kali
**Hanya jalankan terhadap VM lab milik sendiri.** Ganti `T` dengan `http://<IP_VM_DEBIAN>`.
```bash
T=http://<IP_VM_DEBIAN>
curl -s -o /dev/null -w '%{http_code}\n' $T/health                        # TC-01
curl -s -o /dev/null -w '%{http_code}\n' -d 'username=demo&password=demo12345' $T/login   # TC-02
for i in $(seq 1 6); do curl -s -o /dev/null -d 'username=demo&password=salah' $T/login; done  # TC-03
curl -s -o /dev/null -G --data-urlencode "q=x' OR 1=1 --" $T/search       # TC-04
curl -s -o /dev/null --data-urlencode "username=admin' --" -d 'password=x' $T/login  # TC-05
curl -s -o /dev/null -G --data-urlencode 'q=<script>alert(1)</script>' $T/search     # TC-06
curl -s -o /dev/null -d 'author=t' --data-urlencode 'body=<img src=x onerror=alert(1)>' $T/product/1/comment  # TC-07
curl -s -o /dev/null --path-as-is "$T/../../etc/passwd"                   # TC-08
curl -s -o /dev/null -G --data-urlencode 'q=a; cat /etc/passwd' $T/search # TC-09
curl -s -o /dev/null -A 'sqlmap/1.7' $T/                                  # TC-10 (UA saja, bukan sqlmap asli)
for p in .env .git/config wp-admin phpmyadmin; do curl -s -o /dev/null $T/$p; done   # TC-11
for i in $(seq 1 20); do curl -s -o /dev/null $T/tidak-ada-$i; done       # TC-12
# TC-13: 3x login salah lalu 1x benar
for i in 1 2 3; do curl -s -o /dev/null -d 'username=demo&password=x' $T/login; done
curl -s -o /dev/null -d 'username=demo&password=demo12345' $T/login
curl -s -o /dev/null -w '%{http_code}\n' -X POST $T/soc/api/events        # TC-14 -> 403
```
Setelah tiap uji, cek tab **Alert** di dashboard. Catatan: cooldown mencegah alert duplikat; tunggu atau gunakan IP berbeda untuk mengulang.
