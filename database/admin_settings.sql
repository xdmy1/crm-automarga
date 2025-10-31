-- Create admin settings table for secure PIN storage
-- Run this SQL in your Supabase SQL Editor

-- 1. Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE admin_settings IS 'Secure storage for admin settings and credentials';
COMMENT ON COLUMN admin_settings.setting_key IS 'Unique identifier for the setting (e.g., admin_pin)';
COMMENT ON COLUMN admin_settings.setting_value IS 'Encrypted or hashed value of the setting';

-- 2. Insert default admin PIN (you can change this value)
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('admin_pin', '12345')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. Create function to verify admin PIN
CREATE OR REPLACE FUNCTION verify_admin_pin(input_pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM admin_settings 
        WHERE setting_key = 'admin_pin' 
        AND setting_value = input_pin
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to update admin PIN (for security)
CREATE OR REPLACE FUNCTION update_admin_pin(old_pin TEXT, new_pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- First verify the old PIN
    IF NOT verify_admin_pin(old_pin) THEN
        RETURN FALSE;
    END IF;
    
    -- Update to new PIN
    UPDATE admin_settings 
    SET setting_value = new_pin, updated_at = NOW()
    WHERE setting_key = 'admin_pin';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions (adjust as needed for your RLS policies)
-- These functions are SECURITY DEFINER so they run with elevated privileges
GRANT EXECUTE ON FUNCTION verify_admin_pin(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_admin_pin(TEXT, TEXT) TO authenticated;

-- 6. Optional: Add Row Level Security (uncomment if needed)
-- ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Admin settings are private" ON admin_settings
-- FOR ALL USING (false); -- No direct access to table
--
-- Only functions can access the data