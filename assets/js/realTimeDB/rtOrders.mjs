import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
    
const supabaseUrl = 'https://sxvnljeaffmiehlwhmkm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dm5samVhZmZtaWVobHdobWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMTkxNDUsImV4cCI6MjA0NzY5NTE0NX0.jgsqFIQEO5EPpaPZVuXuLZhHXG_Axge6DSaRFLI3lxY';
const supabase = createClient(supabaseUrl, supabaseKey);

const channel = supabase.channel('orders-strikethrough')
    .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
    }, (payload) => {
        
        const { b_received: b_received_old } = payload.old;
        const { id, b_received, l_received } = payload.new;

        let menu = '';
        let received = false;
        if (b_received_old !== b_received) {
            menu = 'b';
            received = b_received
        } else {
            menu = 'l';
            received = l_received
        }

        const orderElement = document.querySelector(`li[data-order-id="${menu}-${id}"]`);
        if (orderElement) {
            if (received) {
                orderElement.classList.add('strikethrough');
            } else {
                orderElement.classList.remove('strikethrough');
            }
        }
    })
    .subscribe();