const connection = require('./config/database');
const { 
    setCurrentToken, 
    clearCurrentToken, 
    getCurrentToken, 
    isCurrentToken,
    cleanupOrphanedCurrentTokens 
} = require('./utils/tokenUtils');

// Test current_token functionality
async function testCurrentToken() {
    console.log('Testing current_token functionality...\n');
    
    try {
        // Test 1: Set current token for a user
        console.log('1. Testing setCurrentToken...');
        const testUserId = 1;
        const testToken = 'test_token_123_' + Date.now();
        
        await setCurrentToken(testUserId, testToken);
        console.log('✓ Current token set successfully');
        
        // Test 2: Get current token
        console.log('\n2. Testing getCurrentToken...');
        const retrievedToken = await getCurrentToken(testUserId);
        if (retrievedToken === testToken) {
            console.log('✓ Current token retrieved successfully');
        } else {
            console.log('✗ Token mismatch:', retrievedToken, 'vs', testToken);
        }
        
        // Test 3: Check if token is current
        console.log('\n3. Testing isCurrentToken...');
        const isCurrent = await isCurrentToken(testToken);
        if (isCurrent) {
            console.log('✓ Token is correctly identified as current');
        } else {
            console.log('✗ Token not identified as current');
        }
        
        // Test 4: Clear current token
        console.log('\n4. Testing clearCurrentToken...');
        await clearCurrentToken(testUserId);
        const clearedToken = await getCurrentToken(testUserId);
        if (clearedToken === null) {
            console.log('✓ Current token cleared successfully');
        } else {
            console.log('✗ Current token not cleared:', clearedToken);
        }
        
        // Test 5: Check if token is still current after clearing
        console.log('\n5. Testing isCurrentToken after clearing...');
        const isStillCurrent = await isCurrentToken(testToken);
        if (!isStillCurrent) {
            console.log('✓ Token correctly identified as not current after clearing');
        } else {
            console.log('✗ Token still identified as current after clearing');
        }
        
        // Test 6: Cleanup orphaned tokens
        console.log('\n6. Testing cleanupOrphanedCurrentTokens...');
        await cleanupOrphanedCurrentTokens();
        console.log('✓ Orphaned current tokens cleanup completed');
        
        console.log('\n🎉 All current_token tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Close database connection
        connection.end();
    }
}

// Run the test
testCurrentToken(); 