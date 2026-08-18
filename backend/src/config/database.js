const mongoose = require('mongoose');

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/recruitai';

const fatal = (title, lines) => {
    console.error('\n' + '='.repeat(70));
    console.error(`FATAL: ${title}`);
    console.error('='.repeat(70));
    lines.forEach(line => console.error(line));
    console.error('='.repeat(70) + '\n');
    process.exit(1);
};

const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production';
    const fallbackAllowed = process.env.ALLOW_LOCAL_DB_FALLBACK === 'true' && !isProduction;

    if (!primaryUri) {
        fatal('MONGODB_URI is not set - the server cannot start.', [
            'The backend has no database connection string.',
            '',
            'Fix:',
            '  1. Copy backend/.env.example to backend/.env',
            '  2. Set MONGODB_URI to your MongoDB connection string',
            '  3. Restart the server',
            '',
            'Note: backend/.env is intentionally not committed to git, so it must',
            'be created manually on every machine after cloning the repository.'
        ]);
    }

    try {
        const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        return conn;
    } catch (primaryError) {
        if (!fallbackAllowed) {
            fatal('Could not connect to the configured MongoDB database.', [
                `Reason: ${primaryError.message}`,
                '',
                'The server has NOT started. It will not fall back to a local database,',
                'because an empty local database makes valid logins fail with',
                '"Invalid email or password" and silently discards new registrations.',
                '',
                'Common causes:',
                '  - Your IP address is not allowed in MongoDB Atlas.',
                '    Fix: Atlas -> Network Access -> Add IP Address -> Add Current IP Address',
                '  - MONGODB_URI in backend/.env is wrong, or the password was rotated.',
                '  - The database user lacks readWrite access to the target database.',
                '  - No internet connection.',
                '',
                'To develop offline against a local MongoDB instead, set',
                'ALLOW_LOCAL_DB_FALLBACK=true in backend/.env (non-production only).'
            ]);
        }

        console.warn(`Primary MongoDB connection failed: ${primaryError.message}`);
        console.warn('ALLOW_LOCAL_DB_FALLBACK is enabled - attempting local MongoDB...');

        try {
            const conn = await mongoose.connect(LOCAL_FALLBACK_URI, { serverSelectionTimeoutMS: 5000 });
            console.warn('*'.repeat(70));
            console.warn('RUNNING ON LOCAL FALLBACK DATABASE - NOT your real data.');
            console.warn(`Host: ${conn.connection.host}  Database: ${conn.connection.name}`);
            console.warn('Accounts from the primary database will NOT be able to log in,');
            console.warn('and anything you create here is stored only on this machine.');
            console.warn('*'.repeat(70));
            return conn;
        } catch (fallbackError) {
            fatal('Both the primary and local fallback MongoDB connections failed.', [
                `Primary error : ${primaryError.message}`,
                `Fallback error: ${fallbackError.message}`,
                '',
                'Check MONGODB_URI in backend/.env and your Atlas Network Access list,',
                'or start a local mongod if you intended to use the fallback.'
            ]);
        }
    }
};

module.exports = connectDB;
