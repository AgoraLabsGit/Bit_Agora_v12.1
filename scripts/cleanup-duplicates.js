#!/usr/bin/env node

// Script to remove duplicate products from BitAgora POS database
async function removeDuplicates() {
  console.log('🔄 Cleaning up duplicate products...');
  
  try {
    // Get all products
    const response = await fetch('http://localhost:3000/api/products');
    const result = await response.json();
    
    if (!result.success) {
      console.log('❌ Failed to fetch products:', result.error);
      return;
    }
    
    const products = result.data;
    console.log(`📊 Found ${products.length} total products`);
    
    // Group by name and category to find duplicates
    const productMap = new Map();
    const duplicates = [];
    
    products.forEach(product => {
      const key = `${product.name.toLowerCase()}_${product.category.toLowerCase()}`;
      if (productMap.has(key)) {
        // Found duplicate - keep the newer one (higher ID or later created)
        const existing = productMap.get(key);
        if (product.createdAt > existing.createdAt) {
          duplicates.push(existing);
          productMap.set(key, product);
        } else {
          duplicates.push(product);
        }
      } else {
        productMap.set(key, product);
      }
    });
    
    console.log(`🔍 Found ${duplicates.length} duplicate products`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    // Remove duplicates
    let removedCount = 0;
    for (const duplicate of duplicates) {
      try {
        const deleteResponse = await fetch(`http://localhost:3000/api/products`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: duplicate.id }),
        });
        
        const deleteResult = await deleteResponse.json();
        
        if (deleteResult.success) {
          console.log(`✅ Removed duplicate: ${duplicate.name}`);
          removedCount++;
        } else {
          console.log(`❌ Failed to remove ${duplicate.name}: ${deleteResult.error}`);
        }
      } catch (error) {
        console.log(`❌ Error removing ${duplicate.name}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully removed: ${removedCount} duplicate products`);
    console.log(`🎉 Database cleanup complete!`);
    
  } catch (error) {
    console.log('❌ Error during cleanup:', error.message);
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
  await removeDuplicates();
}

main().catch(console.error); 