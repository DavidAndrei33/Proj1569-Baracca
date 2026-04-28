# Proj1569 - Pizzeria Baracca

Platformă comenzi online pentru **Pizzeria Baracca** - Pizza napoletană autentică în Moinești.

## Despre Baracca

Pizzeria Baracca este o pizzerie napoletană autentică cu rating 4.9/5 pe Google Maps și #1 pe TripAdvisor în Moinești, situată în Moinești, județul Bacău.

- **Locație:** Strada Plopilor 2c, Moinești
- **Telefon:** +40 755 916 792
- **Program:** 09:00 - 22:00 (Luni, Marți, Joi, Vineri, Sâmbătă, Duminică), Miercuri - INCHIS
- **Specialități:** Pizza napoletană autentică, tiramisu, bere artizanală

## Module

| Modul | Descriere | URL |
|-------|-----------|-----|
| **Landing** | Pagina principală pentru clienți | /customer/ |
| **Store** | Dashboard bucătărie (KDS) | /store/ |
| **Admin** | Management produse, comenzi, rapoarte | /admin/ |

## URL-uri Live

- **Principal:** https://demoproj1569.manifestit.dev
- **Customer:** https://demoproj1569.manifestit.dev/customer/
- **Store:** https://demoproj1569.manifestit.dev/store/
- **Admin:** https://demoproj1569.manifestit.dev/admin/

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma
- **Database:** PostgreSQL
- **Cache:** Redis

## Pornire Locală

```bash
# Backend
cd backend-v2
npm install
npm run dev

# Frontend (Customer)
cd apps/landing
npm install
npm run dev

# Frontend (Admin)
cd apps/admin
npm install
npm run dev
```

## Deploy

```bash
# Build și deploy
cd /var/www/proj1569Baraca
git add .
git commit -m "Update"
git push origin main
```

## Credențiale Test

- **Admin:** admin@baracca.ro / admin123
- **Store PIN:** 1234

## Bazat pe

Proiect fork-uit și adaptat de la [Proj1566 - Rotiserie & Pizza Moinești](https://github.com/DavidAndrei33/Proj1566-rotiserie-pizza-Moinesti)

---
© 2026 Pizzeria Baracca. Toate drepturile rezervate.
