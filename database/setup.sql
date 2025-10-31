-- AutoMarga CRM - Setup Script pentru Supabase
-- Rulează acest script în SQL Editor din dashboard-ul Supabase

-- ===============================================
-- CREAREA TABELELOR
-- ===============================================

-- Tabelul pentru clienți
CREATE TABLE IF NOT EXISTS clienti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nume VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    email VARCHAR(255),
    adresa TEXT,
    data_inregistrare TIMESTAMP DEFAULT NOW(),
    activ BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru mecanici
CREATE TABLE IF NOT EXISTS mecanici (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nume VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    email VARCHAR(255),
    specializare VARCHAR(255),
    data_angajare DATE,
    salariu_orar DECIMAL(8,2),
    activ BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- Tabelul pentru lucrări
CREATE TABLE IF NOT EXISTS lucrari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numar_lucrare VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clienti(id) ON DELETE CASCADE,
    mecanic_id UUID REFERENCES mecanici(id),
    
    -- Informații mașină
    numar_inmatriculare VARCHAR(20),
    marca VARCHAR(100),
    model VARCHAR(100),
    an_fabricatie INTEGER,
    vin VARCHAR(50),
    km INTEGER,
    
    -- Detalii lucrare
    categorie VARCHAR(100),
    descriere TEXT,
    observatii TEXT,
    diagnosticare TEXT,
    
    -- Date și stare
    data_intrare TIMESTAMP DEFAULT NOW(),
    data_estimata TIMESTAMP,
    data_finalizare TIMESTAMP,
    data_livrare TIMESTAMP,
    stare VARCHAR(50) DEFAULT 'in_asteptare',
    prioritate VARCHAR(20) DEFAULT 'normala',
    
    -- Costuri
    cost_manopera DECIMAL(10,2) DEFAULT 0,
    ore_lucrate DECIMAL(5,2) DEFAULT 0,
    cost_piese DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(5,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Status plată
    suma_platita DECIMAL(10,2) DEFAULT 0,
    metoda_plata VARCHAR(50),
    status_plata VARCHAR(50) DEFAULT 'neplatit',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- Tabelul pentru fotografii/documente
CREATE TABLE IF NOT EXISTS lucrari_documente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lucrare_id UUID REFERENCES lucrari(id) ON DELETE CASCADE,
    tip VARCHAR(50), -- 'foto_inainte', 'foto_dupa', 'factura', 'alt'
    nume_fisier VARCHAR(255),
    url_fisier TEXT,
    descriere TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru setări aplicație
CREATE TABLE IF NOT EXISTS setari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cheie VARCHAR(100) UNIQUE NOT NULL,
    valoare TEXT,
    tip VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json'
    descriere TEXT,
    categorie VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru facturi
CREATE TABLE IF NOT EXISTS facturi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numar_factura VARCHAR(50) UNIQUE NOT NULL,
    lucrare_id UUID REFERENCES lucrari(id),
    client_id UUID REFERENCES clienti(id),
    data_factura TIMESTAMP DEFAULT NOW(),
    data_scadenta TIMESTAMP,
    subtotal DECIMAL(10,2),
    tva DECIMAL(10,2),
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'emisa', -- 'emisa', 'platita', 'anulata'
    observatii TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru log activitate
CREATE TABLE IF NOT EXISTS log_activitate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tip_activitate VARCHAR(100) NOT NULL,
    descriere TEXT,
    user_id VARCHAR(100) DEFAULT 'admin',
    entitate_tip VARCHAR(50), -- 'lucrare', 'client', 'piesa', etc.
    entitate_id UUID,
    date_anterioare JSONB,
    date_noi JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- CREAREA SECVENȚELOR
-- ===============================================

-- Secvența pentru numerele de lucrare
CREATE SEQUENCE IF NOT EXISTS numar_lucrare_seq START 1;

-- Secvența pentru numerele de facturi
CREATE SEQUENCE IF NOT EXISTS numar_factura_seq START 1;

-- ===============================================
-- CREAREA INDECȘILOR
-- ===============================================

-- Indecși pentru performanță
CREATE INDEX IF NOT EXISTS idx_lucrari_client ON lucrari(client_id);
CREATE INDEX IF NOT EXISTS idx_lucrari_mecanic ON lucrari(mecanic_id);
CREATE INDEX IF NOT EXISTS idx_lucrari_data ON lucrari(data_intrare);
CREATE INDEX IF NOT EXISTS idx_lucrari_stare ON lucrari(stare);
CREATE INDEX IF NOT EXISTS idx_lucrari_status_plata ON lucrari(status_plata);
CREATE INDEX IF NOT EXISTS idx_lucrari_piese_lucrare ON lucrari_piese(lucrare_id);
CREATE INDEX IF NOT EXISTS idx_lucrari_piese_piesa ON lucrari_piese(piesa_id);
CREATE INDEX IF NOT EXISTS idx_clienti_nume ON clienti(nume);
CREATE INDEX IF NOT EXISTS idx_clienti_telefon ON clienti(telefon);
CREATE INDEX IF NOT EXISTS idx_piese_cod ON piese(cod_piesa);
CREATE INDEX IF NOT EXISTS idx_piese_nume ON piese(nume);
CREATE INDEX IF NOT EXISTS idx_log_data ON log_activitate(created_at);
CREATE INDEX IF NOT EXISTS idx_log_tip ON log_activitate(tip_activitate);

-- ===============================================
-- CREAREA FUNCȚIILOR ȘI TRIGGER-ELOR
-- ===============================================

-- Funcție pentru actualizarea automată a updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplică trigger-ul pe toate tabelele relevante
DROP TRIGGER IF EXISTS update_clienti_updated_at ON clienti;
CREATE TRIGGER update_clienti_updated_at 
    BEFORE UPDATE ON clienti 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mecanici_updated_at ON mecanici;
CREATE TRIGGER update_mecanici_updated_at 
    BEFORE UPDATE ON mecanici 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_piese_updated_at ON piese;
CREATE TRIGGER update_piese_updated_at 
    BEFORE UPDATE ON piese 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lucrari_updated_at ON lucrari;
CREATE TRIGGER update_lucrari_updated_at 
    BEFORE UPDATE ON lucrari 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_setari_updated_at ON setari;
CREATE TRIGGER update_setari_updated_at 
    BEFORE UPDATE ON setari 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facturi_updated_at ON facturi;
CREATE TRIGGER update_facturi_updated_at 
    BEFORE UPDATE ON facturi 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funcție pentru generarea automată a numărului de lucrare
CREATE OR REPLACE FUNCTION generate_numar_lucrare()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numar_lucrare IS NULL OR NEW.numar_lucrare = '' THEN
        NEW.numar_lucrare := 'LUC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('numar_lucrare_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplică trigger-ul pentru numerele de lucrare
DROP TRIGGER IF EXISTS generate_numar_lucrare_trigger ON lucrari;
CREATE TRIGGER generate_numar_lucrare_trigger 
    BEFORE INSERT ON lucrari 
    FOR EACH ROW EXECUTE FUNCTION generate_numar_lucrare();

-- Funcție pentru generarea automată a numărului de factură
CREATE OR REPLACE FUNCTION generate_numar_factura()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numar_factura IS NULL OR NEW.numar_factura = '' THEN
        NEW.numar_factura := 'FAC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('numar_factura_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplică trigger-ul pentru numerele de factură
DROP TRIGGER IF EXISTS generate_numar_factura_trigger ON facturi;
CREATE TRIGGER generate_numar_factura_trigger 
    BEFORE INSERT ON facturi 
    FOR EACH ROW EXECUTE FUNCTION generate_numar_factura();

-- Funcție pentru actualizarea automată a costului total
CREATE OR REPLACE FUNCTION update_total_cost()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_cost := COALESCE(NEW.cost_manopera, 0) + COALESCE(NEW.cost_piese, 0) - COALESCE(NEW.total_cost * NEW.discount / 100, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_lucrari_total_cost ON lucrari;
CREATE TRIGGER update_lucrari_total_cost 
    BEFORE INSERT OR UPDATE ON lucrari 
    FOR EACH ROW EXECUTE FUNCTION update_total_cost();

-- Funcție pentru actualizarea automată a stocului piese
CREATE OR REPLACE FUNCTION update_stoc_piese()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Scade din stoc când se adaugă o piesă într-o lucrare
        UPDATE piese 
        SET stoc = stoc - NEW.cantitate 
        WHERE id = NEW.piesa_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Ajustează stocul la modificare
        UPDATE piese 
        SET stoc = stoc + OLD.cantitate - NEW.cantitate 
        WHERE id = NEW.piesa_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Readaugă în stoc când se șterge o piesă din lucrare
        UPDATE piese 
        SET stoc = stoc + OLD.cantitate 
        WHERE id = OLD.piesa_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_stoc_piese_trigger ON lucrari_piese;
CREATE TRIGGER update_stoc_piese_trigger
    AFTER INSERT OR UPDATE OR DELETE ON lucrari_piese
    FOR EACH ROW EXECUTE FUNCTION update_stoc_piese();

-- Funcție pentru actualizarea automată a costului pieselor în lucrare
CREATE OR REPLACE FUNCTION update_cost_piese_lucrare()
RETURNS TRIGGER AS $$
DECLARE
    lucrare_id_val UUID;
    total_piese DECIMAL(10,2);
BEGIN
    -- Determină ID-ul lucrării
    IF TG_OP = 'DELETE' THEN
        lucrare_id_val := OLD.lucrare_id;
    ELSE
        lucrare_id_val := NEW.lucrare_id;
    END IF;
    
    -- Calculează totalul pieselor pentru această lucrare
    SELECT COALESCE(SUM(pret_total), 0) INTO total_piese
    FROM lucrari_piese 
    WHERE lucrare_id = lucrare_id_val;
    
    -- Actualizează costul pieselor în lucrare
    UPDATE lucrari 
    SET cost_piese = total_piese
    WHERE id = lucrare_id_val;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cost_piese_lucrare_trigger ON lucrari_piese;
CREATE TRIGGER update_cost_piese_lucrare_trigger
    AFTER INSERT OR UPDATE OR DELETE ON lucrari_piese
    FOR EACH ROW EXECUTE FUNCTION update_cost_piese_lucrare();

-- ===============================================
-- INSERAREA DATELOR IMPLICITE
-- ===============================================

-- Setări implicite
INSERT INTO setari (cheie, valoare, tip, descriere, categorie) VALUES
('admin_pin', '12345', 'text', 'PIN-ul administratorului', 'securitate'),
('nume_service', 'AutoMarga Service', 'text', 'Numele service-ului', 'general'),
('adresa_service', '', 'text', 'Adresa service-ului', 'general'),
('telefon_service', '', 'text', 'Telefonul service-ului', 'general'),
('email_service', '', 'text', 'Email-ul service-ului', 'general'),
('tva_procent', '19', 'number', 'Procentul TVA aplicat', 'facturare'),
('valuta', 'MDL', 'text', 'Valuta folosită', 'general'),
('ore_lucru_pe_zi', '8', 'number', 'Ore de lucru pe zi', 'general'),
('zile_lucru_pe_saptamana', '5', 'number', 'Zile de lucru pe săptămână', 'general'),
('backup_automat', 'true', 'boolean', 'Backup automat activat', 'sistem'),
('notificari_email', 'false', 'boolean', 'Notificări email activate', 'notificari')
ON CONFLICT (cheie) DO NOTHING;

-- Mecanici demo (doar dacă nu există deja)
INSERT INTO mecanici (nume, telefon, specializare, data_angajare, salariu_orar, activ) 
SELECT 'Ion Popescu', '0721234567', 'Motor', '2020-01-15', 25.00, true
WHERE NOT EXISTS (SELECT 1 FROM mecanici WHERE nume = 'Ion Popescu');

INSERT INTO mecanici (nume, telefon, specializare, data_angajare, salariu_orar, activ) 
SELECT 'Maria Ionescu', '0731234567', 'Caroserie', '2021-03-10', 22.50, true
WHERE NOT EXISTS (SELECT 1 FROM mecanici WHERE nume = 'Maria Ionescu');

INSERT INTO mecanici (nume, telefon, specializare, data_angajare, salariu_orar, activ) 
SELECT 'Gheorghe Marinescu', '0741234567', 'Electrică', '2019-05-20', 28.00, true
WHERE NOT EXISTS (SELECT 1 FROM mecanici WHERE nume = 'Gheorghe Marinescu');

INSERT INTO mecanici (nume, telefon, specializare, data_angajare, salariu_orar, activ) 
SELECT 'Ana Vladescu', '0751234567', 'Suspensie și frâne', '2022-02-01', 24.00, true
WHERE NOT EXISTS (SELECT 1 FROM mecanici WHERE nume = 'Ana Vladescu');

-- Piese demo (doar dacă nu există deja)
INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Ulei motor 5W-30', 'UL001', 'Uleiuri', 45.50, 20, 5, 'l', 'Castrol'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'UL001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Filtru aer', 'FA001', 'Filtre', 25.00, 15, 3, 'buc', 'Mann Filter'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'FA001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Filtru ulei', 'FO001', 'Filtre', 18.50, 25, 5, 'buc', 'Bosch'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'FO001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Bujii', 'BU001', 'Aprindere', 12.00, 50, 10, 'buc', 'NGK'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'BU001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Disc frână față', 'DF001', 'Frâne', 85.00, 8, 2, 'buc', 'Brembo'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'DF001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Plăcuțe frână față', 'PF001', 'Frâne', 65.00, 12, 3, 'set', 'Ferodo'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'PF001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Antigel', 'AG001', 'Lichide', 35.00, 10, 3, 'l', 'Motul'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'AG001');

INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc, stoc_minim, unitate_masura, furnizor) 
SELECT 'Baterie auto', 'BA001', 'Electrică', 250.00, 5, 1, 'buc', 'Varta'
WHERE NOT EXISTS (SELECT 1 FROM piese WHERE cod_piesa = 'BA001');

-- Clienți demo (doar dacă nu există deja)
INSERT INTO clienti (nume, telefon, email, adresa) 
SELECT 'Andrei Popescu', '0721111111', 'andrei.popescu@email.com', 'Str. Principală nr. 1, București'
WHERE NOT EXISTS (SELECT 1 FROM clienti WHERE nume = 'Andrei Popescu');

INSERT INTO clienti (nume, telefon, email, adresa) 
SELECT 'Elena Ionescu', '0722222222', 'elena.ionescu@email.com', 'Bd. Libertății nr. 25, Cluj-Napoca'
WHERE NOT EXISTS (SELECT 1 FROM clienti WHERE nume = 'Elena Ionescu');

INSERT INTO clienti (nume, telefon, email, adresa) 
SELECT 'Marian Stoica', '0723333333', 'marian.stoica@email.com', 'Str. Mihai Viteazu nr. 10, Timișoara'
WHERE NOT EXISTS (SELECT 1 FROM clienti WHERE nume = 'Marian Stoica');

INSERT INTO clienti (nume, telefon, email, adresa) 
SELECT 'Carmen Dumitrescu', '0724444444', 'carmen.dumitrescu@email.com', 'Aleea Rozelor nr. 5, Constanța'
WHERE NOT EXISTS (SELECT 1 FROM clienti WHERE nume = 'Carmen Dumitrescu');

-- ===============================================
-- CREAREA POLITICILOR RLS (Row Level Security)
-- ===============================================

-- Activează RLS pe toate tabelele
ALTER TABLE clienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE mecanici ENABLE ROW LEVEL SECURITY;
ALTER TABLE piese ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucrari ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucrari_piese ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucrari_documente ENABLE ROW LEVEL SECURITY;
ALTER TABLE setari ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturi ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_activitate ENABLE ROW LEVEL SECURITY;

-- Politici simple - permite tot pentru moment (în producție ar trebui să fie mai restrictive)
DROP POLICY IF EXISTS "Enable all operations" ON clienti;
CREATE POLICY "Enable all operations" ON clienti FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON mecanici;
CREATE POLICY "Enable all operations" ON mecanici FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON piese;
CREATE POLICY "Enable all operations" ON piese FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON lucrari;
CREATE POLICY "Enable all operations" ON lucrari FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON lucrari_piese;
CREATE POLICY "Enable all operations" ON lucrari_piese FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON lucrari_documente;
CREATE POLICY "Enable all operations" ON lucrari_documente FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON setari;
CREATE POLICY "Enable all operations" ON setari FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON facturi;
CREATE POLICY "Enable all operations" ON facturi FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON log_activitate;
CREATE POLICY "Enable all operations" ON log_activitate FOR ALL USING (true);

-- ===============================================
-- VIZUALIZĂRI UTILE
-- ===============================================

-- Vizualizare pentru lucrări cu detalii complete
CREATE OR REPLACE VIEW view_lucrari_complete AS
SELECT 
    l.*,
    c.nume as client_nume,
    c.telefon as client_telefon,
    c.email as client_email,
    m.nume as mecanic_nume,
    m.specializare as mecanic_specializare,
    CASE 
        WHEN l.data_finalizare IS NOT NULL THEN 
            EXTRACT(DAY FROM l.data_finalizare - l.data_intrare)
        ELSE 
            EXTRACT(DAY FROM NOW() - l.data_intrare)
    END as zile_in_service
FROM lucrari l
LEFT JOIN clienti c ON l.client_id = c.id
LEFT JOIN mecanici m ON l.mecanic_id = m.id;

-- Vizualizare pentru statistici piese
CREATE OR REPLACE VIEW view_statistici_piese AS
SELECT 
    p.*,
    COALESCE(SUM(lp.cantitate), 0) as cantitate_utilizata,
    COALESCE(SUM(lp.pret_total), 0) as valoare_utilizata,
    CASE 
        WHEN p.stoc <= p.stoc_minim THEN 'critic'
        WHEN p.stoc <= p.stoc_minim * 2 THEN 'scazut'
        ELSE 'normal'
    END as status_stoc
FROM piese p
LEFT JOIN lucrari_piese lp ON p.id = lp.piesa_id
GROUP BY p.id;

-- ===============================================
-- FINALIZARE
-- ===============================================

-- Mesaj de confirmare
DO $$
BEGIN
    RAISE NOTICE 'AutoMarga CRM database setup completed successfully!';
    RAISE NOTICE 'Default admin PIN: 12345';
    RAISE NOTICE 'Please change the PIN after first login.';
END $$;