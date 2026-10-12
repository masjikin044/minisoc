# 06 — Jaringan & Firewall (UFW)
Bind nginx hanya ke IP LAN melalui `BIND_IP`. Tambahkan UFW di VM:
```bash
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from <CIDR_LAN> to any port 22 proto tcp
sudo ufw allow from <CIDR_LAN> to any port 80 proto tcp
sudo ufw enable
```
**Catatan penting:** Docker memodifikasi iptables sendiri sehingga port yang di-publish bisa melewati UFW. Karena itu pembatasan utama dilakukan lewat `BIND_IP`; UFW adalah lapisan tambahan. Pastikan router tidak melakukan port-forward ke VM ini.
