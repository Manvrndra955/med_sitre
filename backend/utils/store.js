const bcrypt = require('bcryptjs');

// In-Memory data repository fallback with rich enhanced fields
const defaultMedicines = [
  {
    _id: 'med-1',
    title: 'Paracetamol Extra 500mg',
    description: 'Fast-acting pain reliever and fever reducer suitable for headaches, muscle aches, and viral fevers.',
    uses: 'Relieves mild to moderate pain including headache, toothache, and fever reduction.',
    dosage: '1 to 2 tablets every 4-6 hours as needed. Max 8 tablets in 24 hours.',
    precautions: 'Do not exceed recommended dose. Avoid alcohol while taking this medicine.',
    price: 15.50,
    stock: 45,
    category: 'Pain Relief',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    requiresPrescription: false,
    batchNumber: 'BTC-2026-A10',
    expiryDate: '2027-11-15',
    manufacturer: 'Apex Pharma Labs',
    composition: 'Paracetamol 500mg + Caffeine 30mg',
    symptoms: ['Fever', 'Headache', 'Body Ache'],
    isGeneric: false,
    genericSubstituteName: 'Generic Paracetamol Tab',
    createdAt: new Date()
  },
  {
    _id: 'med-2',
    title: 'Amoxicillin 250mg Antibiotic',
    description: 'Broad-spectrum penicillin antibiotic used to treat bacterial infections of ears, nose, throat, and respiratory tract.',
    uses: 'Bacterial chest infections, skin infections, dental abscesses, and urinary infections.',
    dosage: 'Take 1 capsule 3 times daily before or after meals for 7 days.',
    precautions: 'Complete full course even if feeling better. Inform doctor if allergic to penicillin.',
    price: 32.00,
    stock: 8, // Low stock alert
    category: 'Antibiotics',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    requiresPrescription: true,
    batchNumber: 'BTC-2026-B88',
    expiryDate: '2026-09-30', // Expiring soon!
    manufacturer: 'BioHealth Corp',
    composition: 'Amoxicillin Trihydrate 250mg',
    symptoms: ['Bacterial Infection', 'Throat Pain', 'Chest Cough'],
    isGeneric: false,
    genericSubstituteName: 'Generic Amox 250',
    createdAt: new Date()
  },
  {
    _id: 'med-3',
    title: 'Multivitamin & Zinc Boost',
    description: 'Comprehensive daily dietary supplement enriched with Vitamin C, D3, Zinc, and B-Complex for immunity.',
    uses: 'Fights daily fatigue, builds natural immune shield, improves energy levels.',
    dosage: '1 tablet daily after breakfast with water.',
    precautions: 'Do not take on an empty stomach if you have stomach sensitivity.',
    price: 24.99,
    stock: 120,
    category: 'Vitamins & Supplements',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&auto=format&fit=crop&q=60',
    requiresPrescription: false,
    batchNumber: 'BTC-2026-V55',
    expiryDate: '2028-05-20',
    manufacturer: 'NutriLife Care',
    composition: 'Vit C 500mg, Vit D3 2000IU, Zinc 15mg',
    symptoms: ['Fatigue', 'Low Energy', 'Immunity Boost'],
    isGeneric: true,
    genericSubstituteName: '',
    createdAt: new Date()
  },
  {
    _id: 'med-4',
    title: 'Cetirizine 10mg Allergy Relief',
    description: 'Non-drowsy antihistamine for quick relief from seasonal allergies, sneezing, runny nose, and hives.',
    uses: 'Hay fever, pet allergies, dust allergies, skin itching.',
    dosage: '1 tablet daily at night.',
    precautions: 'May cause light drowsiness in sensitive individuals.',
    price: 18.00,
    stock: 0, // OUT OF STOCK
    category: 'Allergy & Cold',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&auto=format&fit=crop&q=60',
    requiresPrescription: false,
    batchNumber: 'BTC-2026-C04',
    expiryDate: '2027-08-10',
    manufacturer: 'RespiCare Ltd',
    composition: 'Cetirizine Hydrochloride 10mg',
    symptoms: ['Cold & Cough', 'Runny Nose', 'Allergy', 'Sneezing'],
    isGeneric: false,
    genericSubstituteName: 'Generic Cetirizine 10',
    createdAt: new Date()
  },
  {
    _id: 'med-5',
    title: 'Omeprazole 20mg Antacid',
    description: 'Proton pump inhibitor that reduces stomach acid production, treating heartburn and acid reflux.',
    uses: 'Acid reflux, GERD, gastric ulcers, stomach burning.',
    dosage: '1 capsule morning 30 minutes before meal.',
    precautions: 'Swallow whole with water. Do not crush or chew.',
    price: 28.50,
    stock: 3, // Very low stock
    category: 'Digestive Health',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=60',
    requiresPrescription: false,
    batchNumber: 'BTC-2026-D99',
    expiryDate: '2026-09-15', // Expiring soon!
    manufacturer: 'GastroMed Solutions',
    composition: 'Omeprazole Delayed Release 20mg',
    symptoms: ['Acidity', 'Heartburn', 'Gas & Indigestion'],
    isGeneric: false,
    genericSubstituteName: 'Generic Omez 20',
    createdAt: new Date()
  }
];

let inMemoryUsers = [];
let inMemoryMedicines = [...defaultMedicines];
let inMemoryOrders = [
  {
    _id: 'ord-101',
    userId: 'usr-1',
    userName: 'John Doe',
    userEmail: 'user@medstore.com',
    userPhone: '9876543210',
    deliveryAddress: { street: '42 Health St', city: 'Metro City', state: 'NY', pincode: '10001' },
    items: [
      { medicineId: 'med-1', title: 'Paracetamol Extra 500mg', price: 15.50, quantity: 2 },
      { medicineId: 'med-3', title: 'Multivitamin & Zinc Boost', price: 24.99, quantity: 1 }
    ],
    totalAmount: 55.99,
    status: 'completed',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    transactionId: 'TXN-984729104',
    createdAt: new Date()
  },
  {
    _id: 'ord-102',
    userId: 'usr-1',
    userName: 'John Doe',
    userEmail: 'user@medstore.com',
    userPhone: '9876543210',
    deliveryAddress: { street: '42 Health St', city: 'Metro City', state: 'NY', pincode: '10001' },
    items: [
      { medicineId: 'med-2', title: 'Amoxicillin 250mg Antibiotic', price: 32.00, quantity: 1 }
    ],
    totalAmount: 32.00,
    status: 'pending',
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    transactionId: 'N/A',
    createdAt: new Date()
  }
];

let inMemoryRequests = [
  {
    _id: 'req-201',
    userId: 'usr-1',
    userName: 'John Doe',
    userEmail: 'user@medstore.com',
    userPhone: '9876543210',
    medicineName: 'Cetirizine 10mg Allergy Relief',
    quantity: 3,
    dueDateTime: 'Tomorrow 5:00 PM',
    note: 'Urgent for severe hay fever allergy.',
    status: 'pending',
    adminReply: '',
    createdAt: new Date()
  }
];

async function initStore() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  if (inMemoryUsers.length === 0) {
    inMemoryUsers.push({
      _id: 'usr-admin',
      name: 'Pharmacy Administrator',
      age: 35,
      email: 'admin@medstore.com',
      phone: '9998887770',
      password: hashedPassword,
      address: { street: 'Main Pharmacy HQ', city: 'Central', state: 'NY', pincode: '10000' },
      role: 'admin',
      createdAt: new Date()
    });

    inMemoryUsers.push({
      _id: 'usr-customer',
      name: 'John Doe',
      age: 28,
      email: 'user@medstore.com',
      phone: '9876543210',
      password: hashedPassword,
      address: { street: '42 Health St', city: 'Metro City', state: 'NY', pincode: '10001' },
      role: 'customer',
      createdAt: new Date()
    });
  }
}

initStore();

module.exports = {
  inMemoryUsers,
  inMemoryMedicines,
  inMemoryOrders,
  inMemoryRequests
};
