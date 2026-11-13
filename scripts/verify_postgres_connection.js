import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:your-db-password@db.aapgcfggzhosratewjpe.supabase.co:5432/postgres';

async function verifyPostgres() {
  console.log('Connecting directly to Supabase PostgreSQL at db.aapgcfggzhosratewjpe.supabase.co:5432...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Successfully established direct TCP/SSL connection to PostgreSQL database!\n');

    // 1. Query tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Public tables found in PostgreSQL:');
    tablesRes.rows.forEach(r => console.log(`  - public.${r.table_name}`));

    // 2. Query row counts
    console.log('\nTable row counts:');
    for (const row of tablesRes.rows) {
      const countRes = await client.query(`SELECT count(*) FROM public."${row.table_name}"`);
      console.log(`  - public.${row.table_name}: ${countRes.rows[0].count} rows`);
    }

    // 3. Query RLS status
    console.log('\nRow Level Security (RLS) status:');
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
    rlsRes.rows.forEach(r => console.log(`  - ${r.tablename}: RLS enabled = ${r.rowsecurity}`));

    // 4. Query triggers
    console.log('\nTriggers configured:');
    const triggersRes = await client.query(`
      SELECT event_object_table, trigger_name, action_timing, event_manipulation 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public';
    `);
    triggersRes.rows.forEach(r => console.log(`  - ${r.trigger_name} ON ${r.event_object_table} (${r.action_timing} ${r.event_manipulation})`));

    console.log('\n✓ Direct PostgreSQL Database verification complete!');
  } finally {
    await client.end();
  }
}

verifyPostgres().catch(err => {
  console.error('Postgres connection error:', err);
  process.exit(1);
});
