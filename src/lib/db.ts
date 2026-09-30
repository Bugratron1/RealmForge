import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

// Example usage: 
// const rows = await sql`SELECT * FROM users`;
