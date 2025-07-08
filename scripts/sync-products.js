// Script to sync POS products to API database
// This ensures dashboard shows the same products as POS

const fetch = require('node-fetch');

// Products from lib/mock-products.ts
const products = [
  // Drinks
  { id: 'coffee-1', name: 'Coffee', price: 3.50, category: 'drinks', emoji: '☕', description: 'Freshly brewed coffee' },
  { id: 'coffee-2', name: 'Coffee', price: 3.50, category: 'drinks', emoji: '☕', description: 'House blend coffee' },
  { id: 'tea-1', name: 'Tea', price: 2.50, category: 'drinks', emoji: '🫖', description: 'Premium tea selection' },
  { id: 'beer-1', name: 'Beer', price: 5.50, category: 'drinks', emoji: '🍺', description: 'Cold craft beer' },
  { id: 'soda-1', name: 'Soda', price: 2.00, category: 'drinks', emoji: '🥤', description: 'Refreshing soft drink' },
  { id: 'juice-1', name: 'Fresh Juice', price: 4.00, category: 'drinks', emoji: '🧃', description: 'Freshly squeezed juice' },

  // Food
  { id: 'sandwich-1', name: 'Sandwich', price: 6.50, category: 'food', emoji: '🥪', description: 'Artisan sandwich' },
  { id: 'pizza-1', name: 'Pizza', price: 12.00, category: 'food', emoji: '🍕', description: 'Wood-fired pizza' },
  { id: 'burger-1', name: 'Burger', price: 8.50, category: 'food', emoji: '🍔', description: 'Gourmet burger' },
  { id: 'pasta-1', name: 'Pasta', price: 9.50, category: 'food', emoji: '🍝', description: 'Fresh pasta dish' },
  { id: 'salad-1', name: 'Salad', price: 7.50, category: 'food', emoji: '🥗', description: 'Fresh garden salad' },
  { id: 'soup-1', name: 'Soup', price: 5.50, category: 'food', emoji: '🍲', description: 'Hearty soup' },

  // Sides
  { id: 'fries-1', name: 'Fries', price: 3.00, category: 'sides', emoji: '🍟', description: 'Crispy french fries' },
  { id: 'wings-1', name: 'Wings', price: 7.00, category: 'sides', emoji: '🍗', description: 'Spicy chicken wings' },
  { id: 'nachos-1', name: 'Nachos', price: 6.00, category: 'sides', emoji: '🌮', description: 'Loaded nachos' },
  { id: 'breadsticks-1', name: 'Breadsticks', price: 4.00, category: 'sides', emoji: '🥖', description: 'Garlic breadsticks' },

  // Desserts
  { id: 'cake-1', name: 'Cake', price: 4.50, category: 'desserts', emoji: '🍰', description: 'Chocolate cake slice' },
  { id: 'pie-1', name: 'Pie', price: 3.50, category: 'desserts', emoji: '🥧', description: 'Apple pie slice' },
  { id: 'cookies-1', name: 'Cookies', price: 2.50, category: 'desserts', emoji: '🍪', description: 'Fresh baked cookies' },
  { id: 'icecream-1', name: 'Ice Cream', price: 3.00, category: 'desserts', emoji: '🍦', description: 'Premium ice cream' },
  { id: 'donut-1', name: 'Donut', price: 2.00, category: 'desserts', emoji: '🍩', description: 'Glazed donut' },
  { id: 'muffin-1', name: 'Muffin', price: 2.75, category: 'desserts', emoji: '🧁', description: 'Blueberry muffin' }
];

async function syncProducts() {
  console.log('🔄 Starting product sync...');
  console.log(`📦 Found ${products.length} products to sync`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of products) {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          category: product.category,
          emoji: product.emoji,
          description: product.description,
          inStock: true,
          stockQuantity: Math.floor(Math.random() * 50) + 10 // Random stock 10-60
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Synced: ${product.name} (${product.category})`);
        successCount++;
      } else {
        console.log(`❌ Failed: ${product.name} - ${result.error}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error syncing ${product.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Sync Results:');
  console.log(`✅ Successfully synced: ${successCount} products`);
  console.log(`❌ Failed to sync: ${errorCount} products`);
  console.log(`🎯 Total: ${successCount + errorCount} products processed`);
  
  // Verify final count
  try {
    const verifyResponse = await fetch('http://localhost:3000/api/products');
    const verifyData = await verifyResponse.json();
    console.log(`\n🔍 Verification: API now has ${verifyData.data.length} products`);
  } catch (error) {
    console.log('❌ Could not verify final product count');
  }
}

// Run the sync
syncProducts().catch(console.error); 