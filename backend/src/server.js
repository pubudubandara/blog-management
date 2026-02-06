import dotenv from 'dotenv';
import app from './app.js';
import db from './config/db.js'; 

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Test DB Connection
        await db.query('SELECT 1'); 
        console.log('✅ MySQL Database Connected');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

startServer();