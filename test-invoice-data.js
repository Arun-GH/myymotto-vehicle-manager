const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

async function addSampleData() {
  const client = await pool.connect();
  
  try {
    // Add sample account information
    await client.query(`
      INSERT INTO account_information (
        customer_name, customer_phone, customer_email, 
        subscription_status, account_created_date, subscription_start_date, 
        subscription_end_date, payment_method
      ) VALUES 
      ('Arun Kumar', '9880105082', 'arun@example.com', 'active', NOW(), NOW(), NOW() + INTERVAL '1 year', 'upi'),
      ('Priya Sharma', '9876543210', 'priya@example.com', 'active', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days', 'card'),
      ('Raj Patel', '9123456789', 'raj@example.com', 'expired', NOW() - INTERVAL '400 days', NOW() - INTERVAL '400 days', NOW() - INTERVAL '35 days', 'upi')
    `);
    
    // Add sample invoices
    await client.query(`
      INSERT INTO invoice_management (
        invoice_number, customer_name, customer_phone, customer_email,
        amount, tax_amount, total_amount, description, 
        invoice_date, due_date, invoice_status
      ) VALUES 
      ('INV-2025-001', 'Arun Kumar', '9880105082', 'arun@example.com', 10000, 1800, 11800, 'Annual subscription - Myymotto Premium', NOW(), NOW() + INTERVAL '30 days', 'paid'),
      ('INV-2025-002', 'Priya Sharma', '9876543210', 'priya@example.com', 10000, 1800, 11800, 'Annual subscription - Myymotto Premium', NOW() - INTERVAL '30 days', NOW(), 'paid'),
      ('INV-2025-003', 'Raj Patel', '9123456789', 'raj@example.com', 10000, 1800, 11800, 'Annual subscription - Myymotto Premium', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days', 'overdue'),
      ('INV-2025-004', 'Amit Singh', '9555666777', 'amit@example.com', 10000, 1800, 11800, 'Annual subscription - Myymotto Premium', NOW(), NOW() + INTERVAL '15 days', 'pending')
    `);
    
    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    client.release();
  }
}

addSampleData();