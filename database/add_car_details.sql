-- Multi-Service Work System Database Schema Update
-- Run this SQL in your Supabase SQL Editor

-- 1. Add new car detail columns to lucrari table
ALTER TABLE lucrari 
ADD COLUMN IF NOT EXISTS vin VARCHAR(17),
ADD COLUMN IF NOT EXISTS combustibil VARCHAR(20), 
ADD COLUMN IF NOT EXISTS putere_motor INTEGER;

-- Add comments for car details
COMMENT ON COLUMN lucrari.vin IS 'Vehicle Identification Number (VIN) - 17 characters';
COMMENT ON COLUMN lucrari.combustibil IS 'Fuel type: benzina, motorina, hibrid, electric, gpl';
COMMENT ON COLUMN lucrari.putere_motor IS 'Engine power in horsepower (CP)';

-- 2. Create table for individual services within a work order
CREATE TABLE IF NOT EXISTS lucrari_servicii (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lucrare_id UUID NOT NULL REFERENCES lucrari(id) ON DELETE CASCADE,
    categorie VARCHAR(100) NOT NULL,
    descriere TEXT NOT NULL,
    cost_piese DECIMAL(10,2) DEFAULT 0,
    cost_manopera DECIMAL(10,2) DEFAULT 0,
    total_serviciu DECIMAL(10,2) GENERATED ALWAYS AS (cost_piese + cost_manopera) STORED,
    mecanic_id UUID REFERENCES mecanici(id),
    observatii TEXT,
    ordine INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add comments for services table
COMMENT ON TABLE lucrari_servicii IS 'Individual services performed within a single work order';
COMMENT ON COLUMN lucrari_servicii.lucrare_id IS 'Reference to main work order';
COMMENT ON COLUMN lucrari_servicii.categorie IS 'Service category (Motor, Electrică, etc.)';
COMMENT ON COLUMN lucrari_servicii.descriere IS 'Detailed description of the service performed';
COMMENT ON COLUMN lucrari_servicii.cost_piese IS 'Cost of parts used in this service';
COMMENT ON COLUMN lucrari_servicii.cost_manopera IS 'Labor cost for this service';
COMMENT ON COLUMN lucrari_servicii.total_serviciu IS 'Auto-calculated total for this service';
COMMENT ON COLUMN lucrari_servicii.ordine IS 'Order of service execution (1, 2, 3...)';

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lucrari_servicii_lucrare_id ON lucrari_servicii(lucrare_id);
CREATE INDEX IF NOT EXISTS idx_lucrari_servicii_categorie ON lucrari_servicii(categorie);
CREATE INDEX IF NOT EXISTS idx_lucrari_vin ON lucrari(vin) WHERE vin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lucrari_combustibil ON lucrari(combustibil) WHERE combustibil IS NOT NULL;

-- 4. Update function to recalculate work order totals when services change
CREATE OR REPLACE FUNCTION update_lucrare_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate total cost for the work order based on all its services
    UPDATE lucrari 
    SET total_cost = (
        SELECT COALESCE(SUM(total_serviciu), 0) 
        FROM lucrari_servicii 
        WHERE lucrare_id = COALESCE(NEW.lucrare_id, OLD.lucrare_id)
    ),
    cost_piese = (
        SELECT COALESCE(SUM(cost_piese), 0) 
        FROM lucrari_servicii 
        WHERE lucrare_id = COALESCE(NEW.lucrare_id, OLD.lucrare_id)
    ),
    cost_manopera = (
        SELECT COALESCE(SUM(cost_manopera), 0) 
        FROM lucrari_servicii 
        WHERE lucrare_id = COALESCE(NEW.lucrare_id, OLD.lucrare_id)
    )
    WHERE id = COALESCE(NEW.lucrare_id, OLD.lucrare_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers to auto-update totals
DROP TRIGGER IF EXISTS trigger_update_lucrare_total_insert ON lucrari_servicii;
DROP TRIGGER IF EXISTS trigger_update_lucrare_total_update ON lucrari_servicii;
DROP TRIGGER IF EXISTS trigger_update_lucrare_total_delete ON lucrari_servicii;

CREATE TRIGGER trigger_update_lucrare_total_insert
    AFTER INSERT ON lucrari_servicii
    FOR EACH ROW EXECUTE FUNCTION update_lucrare_total();

CREATE TRIGGER trigger_update_lucrare_total_update
    AFTER UPDATE ON lucrari_servicii
    FOR EACH ROW EXECUTE FUNCTION update_lucrare_total();

CREATE TRIGGER trigger_update_lucrare_total_delete
    AFTER DELETE ON lucrari_servicii
    FOR EACH ROW EXECUTE FUNCTION update_lucrare_total();

-- 6. Sample data for testing (remove these lines in production)
-- INSERT INTO lucrari_servicii (lucrare_id, categorie, descriere, cost_piese, cost_manopera, ordine) VALUES
-- (1, 'Motor', 'Schimb ulei motor și filtru', 80.00, 50.00, 1),
-- (1, 'Electrică', 'Verificare și reparare alternator', 150.00, 100.00, 2);