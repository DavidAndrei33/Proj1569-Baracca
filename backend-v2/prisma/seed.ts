import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Pizzeria Baracca...");

  // Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: "Pizza Napoletana", slug: "pizza-napoletana", description: "Pizza autentica napoletana", sortOrder: 1 },
      { name: "Schiacciatina", slug: "schiacciatina", description: "Focaccia italiana", sortOrder: 2 },
      { name: "Calzone", slug: "calzone", description: "Pizza pliata italiana", sortOrder: 3 },
      { name: "Pizza Dulce", slug: "pizza-dulce", description: "Pizza cu ingrediente dulci", sortOrder: 4 },
      { name: "Desert", slug: "desert", description: "Deserturi italiene", sortOrder: 5 },
      { name: "Racoritoare", slug: "racoritoare", description: "Sucuri, apa, ice tea", sortOrder: 6 },
      { name: "Bere", slug: "bere", description: "Bere la sticla si draft", sortOrder: 7 },
      { name: "Vinuri / Prosecco", slug: "vinuri-prosecco", description: "Vinuri si prosecco selecte", sortOrder: 8 },
      { name: "Cocktail-uri", slug: "cocktail-uri", description: "Cocktailuri clasice si signature", sortOrder: 9 },
      { name: "Cafea / Ceai / Ciocolata", slug: "cafea-ceai", description: "Cafea, ceai si ciocolata calda", sortOrder: 10 },
      { name: "Digestivo", slug: "digestivo", description: "Digestive italiene", sortOrder: 11 },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${categories.count} categories`);

  // Get category IDs
  const pizzaCat = await prisma.category.findUnique({ where: { slug: "pizza-napoletana" } });
  const schiacciatinaCat = await prisma.category.findUnique({ where: { slug: "schiacciatina" } });
  const calzoneCat = await prisma.category.findUnique({ where: { slug: "calzone" } });
  const pizzaDulceCat = await prisma.category.findUnique({ where: { slug: "pizza-dulce" } });
  const desertCat = await prisma.category.findUnique({ where: { slug: "desert" } });
  const racoritoareCat = await prisma.category.findUnique({ where: { slug: "racoritoare" } });
  const bereCat = await prisma.category.findUnique({ where: { slug: "bere" } });
  const vinuriCat = await prisma.category.findUnique({ where: { slug: "vinuri-prosecco" } });
  const cocktailCat = await prisma.category.findUnique({ where: { slug: "cocktail-uri" } });
  const cafeaCat = await prisma.category.findUnique({ where: { slug: "cafea-ceai" } });
  const digestivoCat = await prisma.category.findUnique({ where: { slug: "digestivo" } });

  // Products
  const products = await prisma.product.createMany({
    data: [
      // Pizza Napoletana
      { name: "Margherita", description: "Aluat, sos de rosii, mozzarella, oregano, ulei de masline (460g)", price: 30.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Margherita Scomposta", description: "Aluat, sos de rosii, mozzarella, pesto, ulei de masline (500g)", price: 32.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, nuci, ou, peste" },
      { name: "Napoli", description: "Aluat, sos de rosii, mozzarella, file de ansoa, oregano (500g)", price: 33.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, peste" },
      { name: "Marinara", description: "Aluat, sos de rosii, file de ansoa, usturoi (410g)", price: 30.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, peste" },
      { name: "Prosciutto Cotto", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto (530g)", price: 32.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Prosciutto Cotto e Funghi", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto, ciuperci champignon proaspete (550g)", price: 33.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Spartacus", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto, salam ventricina piccante, pancetta affumicata (580g)", price: 38.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte", isFeatured: true },
      { name: "San Paolo", description: "Aluat, mozzarella, provola affumicata, Grana Padano, gorgonzola DOP, ceapa rosie, salam ventricina piccante (550g)", price: 37.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Tonnara", description: "Aluat, sos de rosii, mozzarella, ton, ceapa rosie (550g)", price: 33.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, peste" },
      { name: "Siciliana", description: "Aluat, sos de rosii, mozzarella fior di latte, ansoa, rosii cherry, ceapa rosie, capere, oregano, peperoncino (530g)", price: 37.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, peste" },
      { name: "Quattro Formaggi", description: "Aluat, mozzarella, gorgonzola DOP, provola affumicata, Grana Padano (500g)", price: 34.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Parmigiana", description: "Aluat, sos de rosii, mozzarella, vinete, usturoi, Grana Padano, ulei de masline (540g)", price: 33.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Capricciosa", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto, ciuperci champignon proaspete, masline (600g)", price: 34.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Quattro Stagioni", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto, salam ventricina piccante, ciuperci champignon proaspete, masline (600g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Salame Piccante", description: "Aluat, sos de rosii, mozzarella, salam ventricina piccante (500g)", price: 34.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Golosa", description: "Aluat, sos de rosii, mozzarella, salam ventricina piccante, gorgonzola DOP (530g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Vegana", description: "Aluat, sos de rosii, vinete, dovlecei, rucola, ciuperci champignon proaspete, rosii cherry (550g)", price: 32.00, categoryId: pizzaCat!.id, allergens: "gluten" },
      { name: "Verdure", description: "Aluat, sos de rosii, mozzarella, vinete, dovlecei, rucola, ciuperci champignon proaspete, rosii cherry (580g)", price: 34.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Affumicata", description: "Aluat, sos de rosii, mozzarella, provola affumicata, pancetta affumicata (550g)", price: 33.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Bo Bo", description: "Aluat, sos de rosii, mozzarella, provola affumicata, pancetta affumicata, salam ventricina piccante, gorgonzola DOP (580g)", price: 39.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Cacio e Pepe", description: "Aluat, mozzarella, ulei de masline, pancetta affumicata, Grana Padano, pecorino romano, piper negru (480g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Amatriciana", description: "Aluat, sos de rosii, pepperoncino, mozzarella, pancetta affumicata, pecorino romano, piper negru (550g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Bufala DOP", description: "Aluat, sos de rosii, mozzarella di Bufala DOP, busuioc, ulei de masline (470g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Caprese", description: "Aluat, mozzarella di Bufala DOP, rosii cherry, ulei de masline, busuioc (460g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Romagnola", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto, dovlecei, Grana Padano, oregano (600g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Contadina", description: "Aluat, sos de rosii, mozzarella, pancetta affumicata, vinete, usturoi, Grana Padano (590g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Tartufo", description: "Aluat, mozzarella, pancetta affumicata, ciuperci champignon proaspete, sos de trufe, pecorino romano (550g)", price: 37.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Calabrese", description: "Aluat, sos de rosii, mozzarella, salam ventricina piccante, ardei gras, pecorino romano (530g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Imperiale", description: "Aluat, sos de rosii, mozzarella, rosii cherry, prosciutto crudo di Parma, rucola, Grana Padano (650g)", price: 38.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Prosciutto Crudo e Grana", description: "Aluat, sos de rosii, mozzarella, prosciutto crudo di Parma, Grana Padano (550g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Crudaiola", description: "Aluat, sos de rosii, mozzarella fior di latte, prosciutto crudo di Parma, rucola, rosii cherry (700g)", price: 38.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, soia, mustar" },
      { name: "Bresaola", description: "Aluat, sos de rosii, mozzarella fior di latte, bresaola, rucola, Grana Padano (650g)", price: 39.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Tirolese", description: "Aluat, sos de rosii, mozzarella, jambon afumat, gorgonzola DOP (520g)", price: 35.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },
      { name: "Crudonzola", description: "Aluat, sos de rosii, mozzarella, prosciutto crudo di Parma, gorgonzola DOP (550g)", price: 36.00, categoryId: pizzaCat!.id, allergens: "gluten, lapte" },

      // Schiacciatina
      { name: "Schiacciatina Bianca", description: "Aluat, ulei de masline, oregano, sare de mare (300g)", price: 15.00, categoryId: schiacciatinaCat!.id, allergens: "gluten" },
      { name: "Schiacciatina Rossa", description: "Aluat, sos de rosii, ulei de masline, oregano, sare de mare (350g)", price: 20.00, categoryId: schiacciatinaCat!.id, allergens: "gluten, lapte" },

      // Calzone
      { name: "Calzone Imperiale", description: "Aluat, sos de rosii, mozzarella, prosciutto crudo di Parma, Grana Padano (550g)", price: 37.00, categoryId: calzoneCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Calzone Tirolese", description: "Aluat, sos de rosii, mozzarella, jambon afumat, gorgonzola DOP (530g)", price: 37.00, categoryId: calzoneCat!.id, allergens: "gluten, lapte" },
      { name: "Calzone F.Rosso", description: "Aluat, sos de rosii, mozzarella, salam ventricina piccante, gorgonzola DOP (530g)", price: 37.00, categoryId: calzoneCat!.id, allergens: "gluten, lapte" },
      { name: "Calzone Quattro Formaggi", description: "Aluat, mozzarella, gorgonzola DOP, provola affumicata, Grana Padano (500g)", price: 36.00, categoryId: calzoneCat!.id, allergens: "gluten, lapte, ou" },
      { name: "Calzone Farcito", description: "Aluat, sos de rosii, mozzarella, prosciutto cotto, ciuperci champignon proaspete, masline (560g)", price: 36.00, categoryId: calzoneCat!.id, allergens: "gluten, lapte" },
      { name: "Calzone Piccante", description: "Aluat, sos de rosii, mozzarella, salam ventricina piccante (500g)", price: 35.00, categoryId: calzoneCat!.id, allergens: "gluten, lapte" },

      // Pizza Dulce
      { name: "Pizza Nutella", description: "Aluat, nutella, banane (500g)", price: 26.00, categoryId: pizzaDulceCat!.id, allergens: "gluten, lapte, nuci, soia" },

      // Desert
      { name: "Tiramisu", description: "Tiramisu clasic italian (200g)", price: 25.00, categoryId: desertCat!.id, allergens: "gluten, lapte, ou, nuci, soia" },
      { name: "Tarta cu Lime", description: "Tarta racoritoare cu lime (200g)", price: 20.00, categoryId: desertCat!.id },
      { name: "Inghetata Italiana Artizanala", description: "Inghetata artizanala preparata dupa retete traditionale italienesti", price: 15.00, categoryId: desertCat!.id, allergens: "lapte" },

      // Racoritoare
      { name: "Apa 330ml", description: "Apa plata/carbogazoasa 330ml", price: 8.00, categoryId: racoritoareCat!.id },
      { name: "Apa 750ml", description: "Apa plata/carbogazoasa 750ml", price: 11.00, categoryId: racoritoareCat!.id },
      { name: "Lipton Ice Tea 250ml", description: "Lipton Ice Tea - arome: peach, lemon, green tea (250ml)", price: 10.00, categoryId: racoritoareCat!.id },
      { name: "Prigat 250ml", description: "Prigat - arome: capsuni, banane, kiwi, piersici, portocale (250ml)", price: 11.00, categoryId: racoritoareCat!.id },
      { name: "Pepsi 250ml", description: "Pepsi (250ml)", price: 10.00, categoryId: racoritoareCat!.id },
      { name: "Pepsi Twist 250ml", description: "Pepsi Twist (250ml)", price: 10.00, categoryId: racoritoareCat!.id },
      { name: "7UP 250ml", description: "7UP (250ml)", price: 10.00, categoryId: racoritoareCat!.id },
      { name: "Evervess Tonic 250ml", description: "Evervess Tonic (250ml)", price: 10.00, categoryId: racoritoareCat!.id },
      { name: "Mirinda Portocale 250ml", description: "Mirinda Portocale (250ml)", price: 10.00, categoryId: racoritoareCat!.id },
      { name: "Limonada 400ml", description: "Limonada racoritoare (400ml)", price: 13.00, categoryId: racoritoareCat!.id },
      { name: "Suc natural de portocale 250ml", description: "Suc natural proaspat de portocale (250ml)", price: 14.00, categoryId: racoritoareCat!.id },

      // Bere
      { name: "Ursus Premium 500ml", description: "Bere Ursus Premium (500ml)", price: 9.00, categoryId: bereCat!.id, allergens: "gluten" },
      { name: "Ursus Fara Alcool 500ml", description: "Bere Ursus fara alcool (500ml)", price: 9.00, categoryId: bereCat!.id },
      { name: "Ursus Cooler Fara Alc. 330ml", description: "Bere racoritoare fara alcool - arome: lamaie, grefe, cirese (330ml)", price: 9.00, categoryId: bereCat!.id },
      { name: "Peroni 500ml", description: "Bere Peroni (500ml)", price: 13.00, categoryId: bereCat!.id, allergens: "gluten" },
      { name: "Peroni Capri 330ml", description: "Bere Peroni Capri (330ml)", price: 13.00, categoryId: bereCat!.id, allergens: "gluten" },
      { name: "Peroni Fara Alcool 330ml", description: "Bere Peroni fara alcool (330ml)", price: 11.00, categoryId: bereCat!.id },
      { name: "Kozel 330ml", description: "Bere Kozel (330ml)", price: 11.00, categoryId: bereCat!.id, allergens: "gluten" },
      { name: "Ursus Draft 400ml", description: "Bere Ursus la draft (400ml)", price: 10.00, categoryId: bereCat!.id, allergens: "gluten" },

      // Vinuri / Prosecco
      { name: "Vinul casei pahar 200ml", description: "Vinul casei la pahar (200ml)", price: 12.00, categoryId: vinuriCat!.id },
      { name: "Prosecco 120ml", description: "Prosecco (120ml)", price: 12.00, categoryId: vinuriCat!.id },
      { name: "Alb 1L", description: "Vin alb (1L)", price: 40.00, categoryId: vinuriCat!.id },
      { name: "Rose 1L", description: "Vin rose (1L)", price: 40.00, categoryId: vinuriCat!.id },
      { name: "Prosecco Valdobbiadene Superiore 750ml", description: "Prosecco Valdobbiadene Superiore DOCG (750ml)", price: 100.00, categoryId: vinuriCat!.id },

      // Cocktail-uri
      { name: "Gin Tonic 200ml", description: "Gin, apa tonica, lamaie (200ml)", price: 19.00, categoryId: cocktailCat!.id },
      { name: "Cuba Libre 300ml", description: "Rom, cola, lime (300ml)", price: 23.00, categoryId: cocktailCat!.id },
      { name: "Capo Tonic 200ml", description: "Amaro del Capo, apa tonica, lamaie (200ml)", price: 20.00, categoryId: cocktailCat!.id },
      { name: "Aperol Spritz 250ml", description: "Aperol, prosecco, apa minerala, lamaie (250ml)", price: 25.00, categoryId: cocktailCat!.id },
      { name: "Hugo 250ml", description: "Prosecco, sirop de soc, menta, lime (250ml)", price: 25.00, categoryId: cocktailCat!.id },

      // Cafea / Ceai / Ciocolata
      { name: "Espresso", description: "Cafea espresso autentica italiana", price: 8.00, categoryId: cafeaCat!.id },
      { name: "Cappuccino", description: "Cappuccino cremos", price: 10.00, categoryId: cafeaCat!.id, allergens: "lapte" },
      { name: "Cafea decofeinizata", description: "Cafea fara cofeina", price: 7.00, categoryId: cafeaCat!.id },
      { name: "Ice Latte", description: "Cafea latte rece", price: 14.00, categoryId: cafeaCat!.id, allergens: "lapte" },
      { name: "Caffe Latte", description: "Cafea latte calda", price: 14.00, categoryId: cafeaCat!.id, allergens: "lapte" },
      { name: "Ceai", description: "Ceai cald - diverse arome", price: 7.00, categoryId: cafeaCat!.id },
      { name: "Ciocolata calda", description: "Ciocolata calda - neagra sau alba", price: 9.00, categoryId: cafeaCat!.id, allergens: "lapte" },

      // Digestivo
      { name: "Vecchio Amaro del Capo 40ml", description: "Lichior italian amar (40ml)", price: 8.00, categoryId: digestivoCat!.id },
      { name: "Limoncello 40ml", description: "Lichior italian de lamaie (40ml)", price: 7.00, categoryId: digestivoCat!.id },
      { name: "Vecchia Romagna 40ml", description: "Brandy italian (40ml)", price: 8.00, categoryId: digestivoCat!.id },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${products.count} products`);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@baracca.ro" },
    update: {},
    create: {
      email: "admin@baracca.ro",
      password: "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$somehash",
      name: "Admin Baracca",
      role: "ADMIN",
      phone: "+40 755 916 792",
      pin: "1234",
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Business hours (Baracca program)
  const hours = await prisma.businessHour.createMany({
    data: [
      { dayOfWeek: 1, openTime: "09:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 2, openTime: "09:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 3, openTime: "00:00", closeTime: "00:00", isClosed: true },
      { dayOfWeek: 4, openTime: "09:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 5, openTime: "09:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 6, openTime: "09:00", closeTime: "22:00", isClosed: false },
      { dayOfWeek: 0, openTime: "09:00", closeTime: "22:00", isClosed: false },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${hours.count} business hours`);

  // Tables
  const tables = await prisma.table.createMany({
    data: [
      { tableNumber: "M1", capacity: 2, location: "interior" },
      { tableNumber: "M2", capacity: 2, location: "interior" },
      { tableNumber: "M3", capacity: 4, location: "interior" },
      { tableNumber: "M4", capacity: 4, location: "interior" },
      { tableNumber: "M5", capacity: 6, location: "interior" },
      { tableNumber: "M6", capacity: 8, location: "interior" },
      { tableNumber: "T1", capacity: 4, location: "terasa" },
      { tableNumber: "T2", capacity: 4, location: "terasa" },
      { tableNumber: "T3", capacity: 6, location: "terasa" },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${tables.count} tables`);

  // Settings
  const settings = await prisma.setting.createMany({
    data: [
      { key: "restaurantName", value: "Pizzeria Baracca" },
      { key: "address", value: "Strada Plopilor 2c, Moinesti, Bacau" },
      { key: "phone", value: "+40 755 916 792" },
      { key: "email", value: "contact@baracca.ro" },
      { key: "minOrder", value: "0" },
      { key: "deliveryEnabled", value: "false" },
    ],
    skipDuplicates: true,
  });
  console.log(`Created ${settings.count} settings`);

  console.log("Seeding completed for Pizzeria Baracca!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
