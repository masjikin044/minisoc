.PHONY: start init deps config up down logs ps health backup restore test clean
start: init deps config up health  ## semua langkah sekali jalan
init:      ## buat .env: secret, password admin, dan BIND_IP terisi otomatis
	@test -f .env && echo ".env sudah ada (tidak diubah)" || { \
	 IP=$$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($$i=="src") print $$(i+1)}' | head -1); \
	 PW=$$(openssl rand -base64 12 | tr -d '/+=' | cut -c1-12); \
	 cp .env.example .env; \
	 sed -i "s|^SOC_INGEST_TOKEN=.*|SOC_INGEST_TOKEN=$$(openssl rand -hex 32)|; s|^SESSION_SECRET=.*|SESSION_SECRET=$$(openssl rand -hex 32)|; s|^SOC_ADMIN_PASSWORD=.*|SOC_ADMIN_PASSWORD=$$PW|; s|^BIND_IP=.*|BIND_IP=$$IP|" .env; \
	 chmod 600 .env; \
	 echo ".env dibuat. Dashboard: user=admin password=$$PW  BIND_IP=$$IP"; \
	 echo "Ubah di .env bila perlu, lalu jalankan: make up"; }
deps:      ## OPSIONAL: npm install di host (dipakai Docker jika registry tidak terjangkau dari build)
	cd apps/vulnshop && npm install --omit=dev
	cd apps/soc && npm install --omit=dev
config:
	docker compose config -q && echo "compose valid"
up: deps
	docker compose up -d --build
down:
	docker compose down
logs:
	docker compose logs -f --tail=100
ps:
	docker compose ps
health:
	@sleep 8; ./scripts/healthcheck.sh
backup:
	./scripts/backup.sh
restore:
	@test -n "$(FILE)" || (echo "pakai: make restore FILE=backups/xxx.tar.gz" && exit 1)
	./scripts/restore.sh $(FILE)
test:
	cd apps/soc && npm test && cd ../vulnshop && npm test
clean:
	docker compose down -v
