const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'kisan_db.json');

// Initial/default database structure
const DEFAULT_DB = {
  users: [],
  farms: [],
  conversations: [],
  messages: [],
  crop_diagnoses: [],
  disease_alerts: [],
  market_prices: []
};

// Memory cache of the database
let data = { ...DEFAULT_DB };

// Load from disk if it exists
function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      data = JSON.parse(content);
      // Ensure all collections exist
      for (const key of Object.keys(DEFAULT_DB)) {
        if (!data[key]) data[key] = [];
      }
    } else {
      data = { ...DEFAULT_DB };
      save();
    }
  } catch (err) {
    console.error('[db] Error loading database, starting fresh:', err);
    data = { ...DEFAULT_DB };
  }
}

// Save back to disk
function save() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[db] Error writing database to disk:', err);
  }
}

// Initialize database
load();

// Seed default data if empty
if (data.users.length === 0) {
  const adminId = uuidv4();
  const hash = bcrypt.hashSync('admin123', 10);
  data.users.push({
    id: adminId,
    email: 'admin@kisanmitra.local',
    password_hash: hash,
    full_name: 'Admin',
    role: 'admin',
    notification_prefs: '{}',
    is_verified: true,
    created_date: new Date().toISOString()
  });
  console.log('[db] Seeded admin user: admin@kisanmitra.local / admin123');

  // Seed alerts
  const alerts = [
    { id: uuidv4(), disease: 'Early Blight', alert_type: 'Disease', location: 'Kochi', severity: 'Moderate', crop: 'Tomato', report_date: new Date().toISOString().slice(0, 10), recommended_action: 'Apply copper-based fungicide weekly. Remove infected leaves.', active: true, created_date: new Date().toISOString() },
    { id: uuidv4(), disease: 'Powdery Mildew', alert_type: 'Disease', location: 'Ernakulam', severity: 'Low', crop: 'Tomato', report_date: new Date().toISOString().slice(0, 10), recommended_action: 'Improve air circulation. Apply neem oil spray.', active: true, created_date: new Date().toISOString() },
    { id: uuidv4(), disease: 'White Fly Infestation', alert_type: 'Pest', location: 'Thrissur', severity: 'High', crop: 'Cotton', report_date: new Date().toISOString().slice(0, 10), recommended_action: 'Use yellow sticky traps. Apply imidacloprid if severe.', active: true, created_date: new Date().toISOString() },
  ];
  data.disease_alerts.push(...alerts);

  // Seed prices
  const prices = [
    { id: uuidv4(), market: 'Kochi Wholesale Market', location: 'Kochi', crop: 'Tomato', min_price: 14, max_price: 22, avg_price: 18, report_date: new Date().toISOString().slice(0, 10), created_date: new Date().toISOString() },
    { id: uuidv4(), market: 'Ernakulam Vegetable Market', location: 'Ernakulam', crop: 'Tomato', min_price: 15, max_price: 24, avg_price: 19, report_date: new Date().toISOString().slice(0, 10), created_date: new Date().toISOString() },
    { id: uuidv4(), market: 'Palakkad APMC', location: 'Palakkad', crop: 'Rice', min_price: 28, max_price: 34, avg_price: 31, report_date: new Date().toISOString().slice(0, 10), created_date: new Date().toISOString() },
    { id: uuidv4(), market: 'Kozhikode Market', location: 'Kozhikode', crop: 'Banana', min_price: 22, max_price: 30, avg_price: 26, report_date: new Date().toISOString().slice(0, 10), created_date: new Date().toISOString() },
  ];
  data.market_prices.push(...prices);
  save();
}

// Clean helper to get a collection manager
const getCollection = (name) => {
  return {
    list: () => {
      load();
      return data[name] || [];
    },
    find: (filterFn) => {
      load();
      return (data[name] || []).filter(filterFn);
    },
    findOne: (filterFn) => {
      load();
      return (data[name] || []).find(filterFn);
    },
    insert: (item) => {
      load();
      const newItem = {
        id: item.id || uuidv4(),
        created_date: new Date().toISOString(),
        ...item
      };
      data[name].push(newItem);
      save();
      return newItem;
    },
    update: (id, updates) => {
      load();
      const idx = data[name].findIndex(item => item.id === id);
      if (idx === -1) return null;
      data[name][idx] = { ...data[name][idx], ...updates };
      save();
      return data[name][idx];
    },
    delete: (id) => {
      load();
      const idx = data[name].findIndex(item => item.id === id);
      if (idx === -1) return false;
      data[name].splice(idx, 1);
      save();
      return true;
    },
    deleteMany: (filterFn) => {
      load();
      const originalCount = data[name].length;
      data[name] = data[name].filter(item => !filterFn(item));
      const deletedCount = originalCount - data[name].length;
      if (deletedCount > 0) save();
      return deletedCount;
    }
  };
};

module.exports = {
  users: getCollection('users'),
  farms: getCollection('farms'),
  conversations: getCollection('conversations'),
  messages: getCollection('messages'),
  crop_diagnoses: getCollection('crop_diagnoses'),
  disease_alerts: getCollection('disease_alerts'),
  market_prices: getCollection('market_prices'),
};
