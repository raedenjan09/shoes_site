const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test JWT token creation and verification
function testJWT() {
    console.log('Testing JWT token functionality...');
    
    // Test data
    const testUser = {
        id: 1,
        role: 'user'
    };
    
    // Create token with 24h expiry
    const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('Token created:', token.substring(0, 50) + '...');
    
    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', decoded);
        
        // Check expiry
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded.exp;
        const timeLeft = exp - now;
        console.log(`Token expires in ${Math.floor(timeLeft / 3600)} hours and ${Math.floor((timeLeft % 3600) / 60)} minutes`);
        
    } catch (error) {
        console.error('Token verification failed:', error.message);
    }
    
    // Test expired token (create one that expires in 1 second)
    console.log('\nTesting expired token...');
    const expiredToken = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1s' });
    
    setTimeout(() => {
        try {
            const decoded = jwt.verify(expiredToken, process.env.JWT_SECRET);
            console.log('Expired token still valid (should not happen):', decoded);
        } catch (error) {
            console.log('Expired token correctly rejected:', error.message);
        }
    }, 2000);
}

// Run test
testJWT(); 