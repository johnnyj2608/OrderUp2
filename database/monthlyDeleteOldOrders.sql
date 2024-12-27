SELECT cron.schedule(
    'monthly_delete_old_orders',
    '0 0 1 * *',
    $$
    DELETE FROM orders 
    WHERE created_at < NOW() - INTERVAL '3 months';
    $$ 
);