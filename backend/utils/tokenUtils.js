const connection = require('../config/database');

// ========================================
// TOKEN MANAGEMENT FUNCTIONS
// ========================================

// Set current token for a user
const setCurrentToken = (userId, token) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'UPDATE users SET current_token = ? WHERE id = ?',
            [token, userId],
            (err, result) => {
                if (err) {
                    console.log('Error setting current_token:', err);
                    reject(err);
                } else {
                    console.log(`Current token set for user ${userId}`);
                    resolve(result);
                }
            }
        );
    });
};

// Clear current token for a user
const clearCurrentToken = (userId) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'UPDATE users SET current_token = NULL WHERE id = ?',
            [userId],
            (err, result) => {
                if (err) {
                    console.log('Error clearing current_token:', err);
                    reject(err);
                } else {
                    console.log(`Current token cleared for user ${userId}`);
                    resolve(result);
                }
            }
        );
    });
};

// Clear current token by token value
const clearCurrentTokenByValue = (token) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'UPDATE users SET current_token = NULL WHERE current_token = ?',
            [token],
            (err, result) => {
                if (err) {
                    console.log('Error clearing current_token by value:', err);
                    reject(err);
                } else {
                    console.log(`Current token cleared for token: ${token.substring(0, 20)}...`);
                    resolve(result);
                }
            }
        );
    });
};

// Get current token for a user
const getCurrentToken = (userId) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'SELECT current_token FROM users WHERE id = ?',
            [userId],
            (err, results) => {
                if (err) {
                    console.log('Error getting current_token:', err);
                    reject(err);
                } else {
                    resolve(results.length > 0 ? results[0].current_token : null);
                }
            }
        );
    });
};

// Check if a token is the current token for any user
const isCurrentToken = (token) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'SELECT id FROM users WHERE current_token = ?',
            [token],
            (err, results) => {
                if (err) {
                    console.log('Error checking if token is current:', err);
                    reject(err);
                } else {
                    resolve(results.length > 0);
                }
            }
        );
    });
};

// ========================================
// TOKEN CLEANUP FUNCTIONS
// ========================================

// Clean up expired tokens from user_tokens table
const cleanupExpiredTokens = () => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'DELETE FROM user_tokens WHERE expires_at < NOW()',
            [],
            (err, result) => {
                if (err) {
                    console.log('Error cleaning up expired tokens:', err);
                    reject(err);
                } else {
                    console.log(`Cleaned up ${result.affectedRows} expired tokens`);
                    resolve(result);
                }
            }
        );
    });
};

// Clean up expired tokens for a specific user
const cleanupUserExpiredTokens = (userId) => {
    return new Promise((resolve, reject) => {
        connection.execute(
            'DELETE FROM user_tokens WHERE user_id = ? AND expires_at < NOW()',
            [userId],
            (err, result) => {
                if (err) {
                    console.log('Error cleaning up user expired tokens:', err);
                    reject(err);
                } else {
                    console.log(`Cleaned up ${result.affectedRows} expired tokens for user ${userId}`);
                    resolve(result);
                }
            }
        );
    });
};

// Clean up orphaned current tokens (tokens that exist in current_token but not in user_tokens)
const cleanupOrphanedCurrentTokens = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE users u 
            SET current_token = NULL 
            WHERE u.current_token IS NOT NULL 
            AND NOT EXISTS (
                SELECT 1 FROM user_tokens ut 
                WHERE ut.token = u.current_token 
                AND ut.expires_at > NOW()
            )
        `;
        
        connection.execute(sql, [], (err, result) => {
            if (err) {
                console.log('Error cleaning up orphaned current tokens:', err);
                reject(err);
            } else {
                console.log(`Cleaned up ${result.affectedRows} orphaned current tokens`);
                resolve(result);
            }
        });
    });
};

// ========================================
// COMPREHENSIVE CLEANUP FUNCTION
// ========================================

// Comprehensive cleanup function that handles both user_tokens and current_token
const comprehensiveTokenCleanup = async () => {
    try {
        console.log('Starting comprehensive token cleanup...');
        
        // Clean up expired tokens from user_tokens table
        await cleanupExpiredTokens();
        
        // Clean up orphaned current tokens
        await cleanupOrphanedCurrentTokens();
        
        console.log('Comprehensive token cleanup completed successfully');
    } catch (error) {
        console.log('Error during comprehensive token cleanup:', error);
    }
};

// ========================================
// SCHEDULING FUNCTION
// ========================================

// Schedule cleanup every hour
const scheduleTokenCleanup = () => {
    console.log('Scheduling token cleanup...');
    
    // Run cleanup immediately
    comprehensiveTokenCleanup();
    
    // Then schedule it to run every hour
    setInterval(comprehensiveTokenCleanup, 60 * 60 * 1000); // 1 hour in milliseconds
    
    console.log('Token cleanup scheduled to run every hour');
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
    // Token Management
    setCurrentToken,
    clearCurrentToken,
    clearCurrentTokenByValue,
    getCurrentToken,
    isCurrentToken,
    
    // Token Cleanup
    cleanupExpiredTokens,
    cleanupUserExpiredTokens,
    cleanupOrphanedCurrentTokens,
    comprehensiveTokenCleanup,
    scheduleTokenCleanup
}; 