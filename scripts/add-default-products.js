#!/usr/bin/env node

// Script to add default products to BitAgora POS database
const products = [
  // Drinks
  { name: "Coffee", price: 3.50, category: "drinks", emoji: "☕", description: "Freshly brewed coffee", inStock: true, stockQuantity: 50 },
  { name: "Tea", price: 2.50, category: "drinks", emoji: "🍵", description: "Premium tea selection", inStock: true, stockQuantity: 40 },
  { name: "Beer", price: 5.50, category: "drinks", emoji: "🍺", description: "Cold craft beer", inStock: true, stockQuantity: 24 },
  { name: "Soda", price: 2.00, category: "drinks", emoji: "🥤", description: "Refreshing soft drink", inStock: true, stockQuantity: 60 },
  { name: "Fresh Juice", price: 4.00, category: "drinks", emoji: "🧃", description: "Freshly squeezed juice", inStock: true, stockQuantity: 20 },
  
  // Food
  { name: "Sandwich", price: 6.50, category: "food", emoji: "🥪", description: "Artisan sandwich", inStock: true, stockQuantity: 25 },
  { name: "Pizza", price: 12.00, category: "food", emoji: "🍕", description: "Wood-fired pizza", inStock: true, stockQuantity: 15 },
  { name: "Burger", price: 8.50, category: "food", emoji: "🍔", description: "Gourmet burger", inStock: true, stockQuantity: 30 },
  { name: "Pasta", price: 9.50, category: "food", emoji: "🍝", description: "Fresh pasta dish", inStock: true, stockQuantity: 20 },
  { name: "Salad", price: 7.50, category: "food", emoji: "🥗", description: "Fresh garden salad", inStock: true, stockQuantity: 35 },
  { name: "Soup", price: 5.50, category: "food", emoji: "🍲", description: "Hearty soup", inStock: true, stockQuantity: 18 },
  
  // Sides
  { name: "Fries", price: 3.00, category: "sides", emoji: "🍟", description: "Crispy french fries", inStock: true, stockQuantity: 40 },
  { name: "Wings", price: 7.00, category: "sides", emoji: "🍗", description: "Spicy chicken wings", inStock: true, stockQuantity: 22 },
  { name: "Nachos", price: 6.00, category: "sides", emoji: "🌮", description: "Loaded nachos", inStock: true, stockQuantity: 15 },
  { name: "Breadsticks", price: 4.00, category: "sides", emoji: "🥖", description: "Garlic breadsticks", inStock: true, stockQuantity: 30 },
  
  // Desserts
  { name: "Cake", price: 4.50, category: "desserts", emoji: "🍰", description: "Chocolate cake slice", inStock: true, stockQuantity: 12 },
  { name: "Pie", price: 3.50, category: "desserts", emoji: "🥧", description: "Apple pie slice", inStock: true, stockQuantity: 10 },
  { name: "Cookies", price: 2.50, category: "desserts", emoji: "🍪", description: "Fresh baked cookies", inStock: true, stockQuantity: 25 },
  { name: "Ice Cream", price: 3.00, category: "desserts", emoji: "🍦", description: "Premium ice cream", inStock: true, stockQuantity: 20 },
  { name: "Donut", price: 2.00, category: "desserts", emoji: "🍩", description: "Glazed donut", inStock: true, stockQuantity: 18 },
  { name: "Muffin", price: 2.75, category: "desserts", emoji: "🧁", description: "Blueberry muffin", inStock: true, stockQuantity: 15 }
];

async function addProducts() {
  let addedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  console.log(`🍽️  Adding ${products.length} default products to BitAgora POS...`);
  
  // First, get existing products to check for duplicates
  const existingResponse = await fetch('http://localhost:3000/api/products');
  const existingResult = await existingResponse.json();
  const existingProducts = existingResult.success ? existingResult.data : [];
  
  // Create a set of existing product keys (name + category)
  const existingKeys = new Set(
    existingProducts.map(p => `${p.name.toLowerCase()}_${p.category.toLowerCase()}`)
  );
  
  for (const product of products) {
    const productKey = `${product.name.toLowerCase()}_${product.category.toLowerCase()}`;
    
    // Check if product already exists
    if (existingKeys.has(productKey)) {
      console.log(`⏭️  Skipped: ${product.name} (already exists)`);
      skippedCount++;
      continue;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Added: ${product.name} - $${product.price}`);
        addedCount++;
        existingKeys.add(productKey); // Update our tracking set
      } else {
        console.log(`❌ Failed to add ${product.name}: ${result.error}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Error adding ${product.name}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully added: ${addedCount} products`);
  console.log(`⏭️  Skipped (already exist): ${skippedCount} products`);
  console.log(`❌ Failed to add: ${errorCount} products`);
  
  if (addedCount > 0) {
    console.log(`🎉 New products are now available in your POS system!`);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔄 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the development server first:');
    console.log('   npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await addProducts();
}

main().catch(console.error); 