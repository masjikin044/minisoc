# 03 — Proxmox & VM Debian 12
1. Unggah ISO Debian 12 (netinst) ke storage Proxmox.
2. Buat VM: OS type Linux, 2 vCPU, 2–4 GB RAM, disk 20+ GB, bridge `vmbr0`.
3. Instal Debian (pilih "SSH server" dan "standard system utilities").
4. Beri IP tetap (DHCP reservation atau `/etc/network/interfaces`), catat sebagai `<IP_VM_DEBIAN>`.
5. Update: `sudo apt update && sudo apt upgrade -y`.
6. Opsional: snapshot VM di Proxmox sebelum deploy pertama.
