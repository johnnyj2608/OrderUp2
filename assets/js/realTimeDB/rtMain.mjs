import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://sxvnljeaffmiehlwhmkm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dm5samVhZmZtaWVobHdobWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMTkxNDUsImV4cCI6MjA0NzY5NTE0NX0.jgsqFIQEO5EPpaPZVuXuLZhHXG_Axge6DSaRFLI3lxY';
const supabase = createClient(supabaseUrl, supabaseKey);

const channel = supabase.channel('orders-submit')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
    }, (payload) => {
        const { member_id, breakfast, lunch } = payload.new;
        const listItem = document.querySelector(`li[data-index="${member_id}"]`);

        if (breakfast && lunch) {
            listItem.parentNode.removeChild(listItem);
        } else if (breakfast) {
            listItem.setAttribute('data-menu', 'L');
            listItem.querySelector('.menu-type').innerText = typeL;
        } else if (lunch) {
            listItem.setAttribute('data-menu', 'B');
            listItem.querySelector('.menu-type').innerText = typeB;
        }
    })
    .subscribe();