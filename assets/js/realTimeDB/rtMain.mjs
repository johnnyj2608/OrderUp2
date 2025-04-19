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
        if (payload.eventType === 'DELETE') {
            return;
        }

        const { member_id, breakfast, lunch } = payload.new;
        const { breakfast: breakfast_old = null, lunch: lunch_old = null } = payload.old
        const listItem = document.querySelector(`li[data-index="${member_id}"]`);

        const breakfastCount = parseInt(listItem.getAttribute('data-breakfast'));
        const lunchCount = parseInt(listItem.getAttribute('data-lunch'));
        const unitsCount = parseInt(listItem.getAttribute('data-units'));

        if (breakfast !== breakfast_old) {
            listItem.setAttribute('data-breakfast', breakfastCount+1);
        }

        if (lunch !== lunch_old) {
            listItem.setAttribute('data-lunch', lunchCount+1);
        }

        const currentBreakfastCount = listItem.getAttribute('data-breakfast');
        const currentLunchCount = listItem.getAttribute('data-lunch');

        if (currentBreakfastCount >= unitsCount && currentLunchCount >= unitsCount) {
            listItem.parentNode.removeChild(listItem);
        } else if (currentBreakfastCount >= unitsCount) {
            listItem.querySelector('.menu-type').innerText = typeL;
        } else if (currentLunchCount >= unitsCount) {
            listItem.querySelector('.menu-type').innerText = typeB;
        }
    })
    .subscribe();