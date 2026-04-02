require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Food = require('./models/Food');

const DEFAULT_IMAGE = '/uploads/burger.png';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([User.deleteMany(), Category.deleteMany(), Food.deleteMany()]);
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin',
      username: 'admin',
      email: 'admin@foodorder.com',
      phone: '+998901234567',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Test User',
      email: 'user@foodorder.com',
      phone: '+998907654321',
      password: 'user123',
      role: 'user',
    });

    console.log('Users created');

    const categories = await Category.insertMany([
      { name: { uz: 'Burgerlar', ru: 'Бургеры', en: 'Burgers' }, image: DEFAULT_IMAGE },
      { name: { uz: 'Pitsa', ru: 'Пицца', en: 'Pizza' }, image: DEFAULT_IMAGE },
      { name: { uz: 'Sushi', ru: 'Суши', en: 'Sushi' }, image: DEFAULT_IMAGE },
      { name: { uz: 'Salatlar', ru: 'Салаты', en: 'Salads' }, image: DEFAULT_IMAGE },
      { name: { uz: 'Ichimliklar', ru: 'Напитки', en: 'Drinks' }, image: DEFAULT_IMAGE },
      { name: { uz: 'Shirinliklar', ru: 'Десерты', en: 'Desserts' }, image: DEFAULT_IMAGE },
    ]);

    console.log('Categories created');

    const foods = [
      {
        name: { uz: 'Klassik Burger', ru: 'Классический бургер', en: 'Classic Burger' },
        description: {
          uz: 'Yangi mol go\'shti, salat, pomidor va maxsus sous bilan',
          ru: 'Свежая говядина, салат, помидор и фирменный соус',
          en: 'Fresh beef patty with lettuce, tomato and special sauce',
        },
        price: 35000,
        categoryId: categories[0]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Beef', 'Lettuce', 'Tomato', 'Cheese', 'Special Sauce'],
        isPopular: true,
      },
      {
        name: { uz: 'Chicken Burger', ru: 'Чикен бургер', en: 'Chicken Burger' },
        description: {
          uz: 'Tovuq filesi, salat va mayonez bilan',
          ru: 'Куриное филе, салат и майонез',
          en: 'Crispy chicken fillet with lettuce and mayo',
        },
        price: 30000,
        categoryId: categories[0]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Chicken', 'Lettuce', 'Mayo', 'Bun'],
        isPopular: true,
      },
      {
        name: { uz: 'Double Burger', ru: 'Двойной бургер', en: 'Double Burger' },
        description: {
          uz: 'Ikki qavat go\'sht, pishloq va sous',
          ru: 'Двойная котлета, сыр и соус',
          en: 'Double beef patty with cheese and sauce',
        },
        price: 45000,
        categoryId: categories[0]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Double Beef', 'Cheese', 'Onion', 'Pickles', 'Sauce'],
        isPopular: false,
      },
      {
        name: { uz: 'Margarita Pitsa', ru: 'Пицца Маргарита', en: 'Margherita Pizza' },
        description: {
          uz: 'Mozzarella pishloq, pomidor sousi va rayhon',
          ru: 'Моцарелла, томатный соус и базилик',
          en: 'Mozzarella cheese, tomato sauce, and fresh basil',
        },
        price: 55000,
        categoryId: categories[1]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil'],
        isPopular: true,
      },
      {
        name: { uz: 'Pepperoni Pitsa', ru: 'Пицца Пепперони', en: 'Pepperoni Pizza' },
        description: {
          uz: 'Pepperoni kolbasa va mozzarella pishloq',
          ru: 'Пепперони и моцарелла',
          en: 'Pepperoni sausage with mozzarella cheese',
        },
        price: 60000,
        categoryId: categories[1]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce'],
        isPopular: true,
      },
      {
        name: { uz: 'California Roll', ru: 'Калифорния ролл', en: 'California Roll' },
        description: {
          uz: 'Krab tayoqchasi, avokado va tuxum bilan',
          ru: 'Крабовая палочка, авокадо и яйцо',
          en: 'Crab stick, avocado, and egg',
        },
        price: 40000,
        categoryId: categories[2]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Crab Stick', 'Avocado', 'Rice', 'Nori'],
        isPopular: true,
      },
      {
        name: { uz: 'Philadelphia Roll', ru: 'Филадельфия ролл', en: 'Philadelphia Roll' },
        description: {
          uz: 'Losos, krem-pishloq va bodring',
          ru: 'Лосось, сливочный сыр и огурец',
          en: 'Salmon, cream cheese, and cucumber',
        },
        price: 50000,
        categoryId: categories[2]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Salmon', 'Cream Cheese', 'Cucumber', 'Rice'],
        isPopular: false,
      },
      {
        name: { uz: 'Sezar Salat', ru: 'Салат Цезарь', en: 'Caesar Salad' },
        description: {
          uz: 'Tovuq, salat barglari, krutton va parmezan',
          ru: 'Курица, листья салата, гренки и пармезан',
          en: 'Chicken, romaine lettuce, croutons and parmesan',
        },
        price: 32000,
        categoryId: categories[3]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Chicken', 'Romaine', 'Croutons', 'Parmesan', 'Caesar Dressing'],
        isPopular: true,
      },
      {
        name: { uz: 'Coca-Cola', ru: 'Кока-Кола', en: 'Coca-Cola' },
        description: {
          uz: 'Klassik Coca-Cola 0.5L',
          ru: 'Классическая Кока-Кола 0.5Л',
          en: 'Classic Coca-Cola 0.5L',
        },
        price: 8000,
        categoryId: categories[4]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: [],
        isPopular: false,
      },
      {
        name: { uz: 'Limonad', ru: 'Лимонад', en: 'Lemonade' },
        description: {
          uz: 'Yangi tayyorlangan limonad',
          ru: 'Свежеприготовленный лимонад',
          en: 'Freshly made lemonade',
        },
        price: 12000,
        categoryId: categories[4]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Lemon', 'Sugar', 'Water', 'Mint'],
        isPopular: true,
      },
      {
        name: { uz: 'Tiramisu', ru: 'Тирамису', en: 'Tiramisu' },
        description: {
          uz: 'Klassik italyan shirinligi',
          ru: 'Классический итальянский десерт',
          en: 'Classic Italian dessert with mascarpone and coffee',
        },
        price: 25000,
        categoryId: categories[5]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Mascarpone', 'Coffee', 'Cocoa', 'Ladyfingers'],
        isPopular: true,
      },
      {
        name: { uz: 'Cheesecake', ru: 'Чизкейк', en: 'Cheesecake' },
        description: {
          uz: 'New York uslubidagi cheesecake',
          ru: 'Чизкейк в стиле Нью-Йорк',
          en: 'New York style cheesecake',
        },
        price: 28000,
        categoryId: categories[5]._id,
        image: DEFAULT_IMAGE,
        images: [DEFAULT_IMAGE],
        ingredients: ['Cream Cheese', 'Graham Cracker', 'Sugar', 'Eggs'],
        isPopular: false,
      },
    ];

    await Food.insertMany(foods);
    console.log('Foods created');

    console.log('\n--- Seed Complete ---');
    console.log('Admin: username "admin" / password "admin123"');
    console.log('User:  email "user@foodorder.com" / password "user123"');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
