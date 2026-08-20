import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vxzvluqudwxnhgtvbqpp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4enZsdXF1ZHd4bmhndHZicXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTcxODQsImV4cCI6MjEwMjYzMzE4NH0.xl_LOCfqUxaOLbbdEA_gjn_aviFpgQqXjybSJDO-LQw'

export const supabase = createClient(supabaseUrl, supabaseKey)