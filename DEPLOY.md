# 🚀 Deployment Guide - Rotiserie & Pizza Moinești

## 📋 PROBLEMA REZOLVATĂ (27 Apr 2026)

**Issue:** Bugurile reparate "reapăreau" după `git pull`

**Cauza:** Folderele deployate (`landing/`, `store/`, `admin/`) erau în `.gitignore`
→ Build-urile NU ajungeau pe GitHub → Andrei primea doar sursele, nu build-urile

**Soluția aplicată:**
1. ✅ Scos folderele din `.gitignore`
2. ✅ Adăugat `axios` în toate proiectele (landing, store, admin)
3. ✅ Build și commit la toate modulele
4. ✅ Setup CI/CD GitHub Actions pentru automatizare

---

## 🔄 Workflow Deployment (CUM FUNCȚIONEAZĂ ACUM)

### Pentru Developer (eu):
```
1. Modific cod în apps/*/src/
2. npm run build (în modulul modificat)
3. cp -r apps/*/dist/* */
4. git add . && git commit && git push
5. ✅ Build-urile ajung pe GitHub
```

### Pentru Andrei (pe server):
```
cd /var/www/rotiserie
git pull origin main
# ✅ Primește SURSELE + BUILD-urile
# ✅ Site-urile sunt automat actualizate
```

---

## 🌐 Module și URL-uri

| Modul | Cod Sursă | Deploy Folder | URL | Descriere |
|-------|-----------|---------------|-----|-----------|
| **Landing** | `apps/landing/` | `landing/` | rotiseriemoinesti.manifestit.dev | Client - Comenzi online |
| **Store** | `apps/store-v2/` | `store/` | storerotiserie.manifestit.dev | Bucătărie - Management comenzi |
| **Admin** | `apps/admin/` | `admin/` | adminrotiserie.manifestit.dev | Admin - Produse, rapoarte, setări |
| **Backend** | `backend-v2/` | PM2 process | localhost:5002 | API + DB |

---

## 🤖 CI/CD Automat (GitHub Actions)

**Fișier:** `.github/workflows/build-check.yml`

**Ce face:**
- La fiecare push în `main`, verifică că toate modulele fac build cu succes
- NU deployează automat (evită probleme de permisiuni)

**Status builds:** https://github.com/DavidAndrei33/rotiserie-pizza-moinesti/actions

**Notă:** Deploy-ul real se face prin commit manual la folderele `landing/`, `store/`, `admin/` (deja fixat).

---

## 🛠️ Manual Deploy (dacă e necesar)

### Build toate modulele:
```bash
cd /var/www/rotiserie

# Admin
cd apps/admin && npm run build && cd ../..
cp -r apps/admin/dist/* admin/

# Landing
cd apps/landing && npm run build && cd ../..
cp -r apps/landing/dist/* landing/

# Store
cd apps/store-v2 && npm run build && cd ../..
cp -r apps/store-v2/dist/* store/

# Commit
git add -A && git commit -m "[DEPLOY] Manual build all modules" && git push
```

### Restart backend:
```bash
pm2 restart rotiserie-backend-v2
```

---

## 🐛 Debugging

### "Nu se încarcă datele"
```bash
# Verifică dacă backend-ul rulează
curl http://localhost:5002/health

# Restart dacă e necesar
pm2 restart rotiserie-backend-v2
```

### "Pagina e goală/veche"
```bash
# 1. Pull ultima versiune
git pull origin main

# 2. Verifică timestamps
cd /var/www/rotiserie && ls -la landing/ store/ admin/

# 3. Dacă e vechi, build manual (vezi secțiunea de mai sus)
```

### "Eroare 404 la API"
```bash
# Verifică Caddy
cat /etc/caddy/Caddyfile | grep -A5 "rotiserie"

# Reload Caddy
caddy reload --config /etc/caddy/Caddyfile
```

---

## 📁 Structura Proiectului

```
/workspace/shared/rotiserie-pizza-moinesti/  (repo Git)
├── apps/
│   ├── admin/          ← Surse Admin (React)
│   ├── landing/        ← Surse Landing (React)
│   └── store-v2/       ← Surse Store (React + TypeScript)
├── backend-v2/         ← Backend API (Fastify + Prisma)
├── admin/              ← BUILD Admin (deployat)
├── landing/            ← BUILD Landing (deployat)
├── store/              ← BUILD Store (deployat)
└── .github/workflows/  ← CI/CD automat

/var/www/rotiserie/     (deploy pe server - symlink sau direct)
├── admin/              ← Copy din repo
├── landing/            ← Copy din repo
├── store/              ← Copy din repo
└── backend-v2/         ← Copy din repo
```

---

## ⚠️ IMPORTANT

1. **NU șterge folderele `landing/`, `store/`, `admin/`** - conțin build-urile deployate
2. **NU modifica direct în folderele deployate** - modifică în `apps/*/src/` și builduiește
3. **Dacă adaugi un modul nou** - adaugă și în `.github/workflows/deploy.yml`

---

## 📞 Suport

Dacă ceva nu merge:
1. Verifică GitHub Actions: https://github.com/DavidAndrei33/rotiserie-pizza-moinesti/actions
2. Verifică logs: `pm2 logs rotiserie-backend-v2`
3. Întreabă-mă pe Telegram!
