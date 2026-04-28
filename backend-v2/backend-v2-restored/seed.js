require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

connectDB();

const seedData = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Ștergere date existente
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Date vechi șterse');

    // Creare categorii
    const categories = await Category.create([
      { name: 'Pizza', description: 'Pizza artizanală din cuptor cu lemne', order: 1 },
      { name: 'Rotiserie', description: 'Frigărui, aripioare, crispy', order: 2 },
      { name: 'Garnituri', description: 'Cartofi prăjiți, orez, salate', order: 3 },
      { name: 'Băuturi', description: 'Sucuri, apă, bere', order: 4 }
    ]);
    console.log('✅ Categorii create:', categories.length);

    // Creare produse
    const products = await Product.create([
      {
        name: 'Pizza Margherita',
        description: 'Sos de roșii, mozzarella, busuioc proaspăt',
        price: 28,
        category: categories[0]._id,
        ingredients: ['sos roșii', 'mozzarella', 'busuioc'],
        isPopular: true,
        preparationTime: 15
      },
      {
        name: 'Pizza Diavola',
        description: 'Sos de roșii, mozzarella, salam picant, ardei',
        price: 32,
        category: categories[0]._id,
        ingredients: ['sos roșii', 'mozzarella', 'salam picant', 'ardei'],
        isPopular: true,
        preparationTime: 18
      },
      {
        name: 'Pizza Quattro Formaggi',
        description: 'Mozzarella, gorgonzola, parmezan, brie',
        price: 35,
        category: categories[0]._id,
        ingredients: ['mozzarella', 'gorgonzola', 'parmezan', 'brie'],
        preparationTime: 18
      },
      {
        name: 'Frigărui de pui',
        description: '6 bucăți frigărui de pui marinat',
        price: 25,
        category: categories[1]._id,
        ingredients: ['pui', 'condimente'],
        isPopular: true,
        preparationTime: 12
      },
      {
        name: 'Aripioare picante',
        description: '8 aripioare de pui în sos picant',
        price: 28,
        category: categories[1]._id,
        ingredients: ['aripioare pui', 'sos picant'],
        isPopular: true,
        preparationTime: 15
      },
      {
        name: 'Crispy strips',
        description: '300g crispy de pui crocant',
        price: 30,
        category: categories[1]._id,
        ingredients: ['pui crispy', 'breading'],
        preparationTime: 12
      },
      {
        name: 'Cartofi prăjiți',
        description: '300g cartofi prăjiți crocanți',
        price: 12,
        category: categories[2]._id,
        isPopular: true,
        preparationTime: 8
      },
      {
        name: 'Salată grecească',
        description: 'Roșii, castraveți, măsline, feta',
        price: 18,
        category: categories[2]._id,
        ingredients: ['roșii', 'castraveți', 'măsline', 'feta', 'ulei de măsline'],
        preparationTime: 5
      },
      {
        name: 'Coca-Cola 0.5L',
        description: 'Sticlă 500ml',
        price: 8,
        category: categories[3]._id,
        preparationTime: 0
      },
      {
        name: 'Apă plată 0.5L',
        description: 'Sticlă 500ml',
        price: 5,
        category: categories[3]._id,
        preparationTime: 0
      }
    ]);
    console.log('✅ Produse create:', products.length);

    // Creare utilizatori
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@rotiserie.ro',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'bucatarie',
        email: 'bucatarie@rotiserie.ro',
        password: 'bucatarie123',
        role: 'bucatarie'
      },
      {
        username: 'staff',
        email: 'staff@rotiserie.ro',
        password: 'staff123',
        role: 'staff'
      }
    ]);
    console.log('✅ Utilizatori creați:', users.length);

    console.log('\n🎉 Database seeded successfully!');
    console.log('👤 Login conturi:');
    console.log('   admin / admin123 (full access)');
    console.log('   bucatarie / bucatarie123 (comenzi + status)');
    console.log('   staff / staff123 (doar vizualizare)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();