const connection = require('./config/database');

console.log('Testing database connection...');

// Test basic connection
connection.query('SELECT 1 as test', (err, results) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error checking tables:', err);
            process.exit(1);
        }
        console.log('✅ Tables found:', results.map(row => Object.values(row)[0]));
        
        // Test users table
        connection.query('SELECT COUNT(*) as count FROM users', (err, results) => {
            if (err) {
                console.error('Error checking users table:', err);
                process.exit(1);
            }
            console.log('✅ Users table accessible, count:', results[0].count);
            
            // Test items table
            connection.query('SELECT COUNT(*) as count FROM item', (err, results) => {
                if (err) {
                    console.error('Error checking items table:', err);
                    process.exit(1);
                }
                console.log('✅ Items table accessible, count:', results[0].count);
                
                console.log('\n🎉 All database tests passed!');
                process.exit(0);
            });
        });
    });
}); 