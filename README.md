# AutoMarga CRM - Sistem de Management Service Auto

O aplicație web completă pentru gestionarea unui service auto, construită cu **Vanilla JavaScript**, **TailwindCSS** și **Supabase**.

## 🚀 Caracteristici Principale

### 🔧 Managementul Lucrărilor
- Adăugare, editare și ștergere lucrări
- Tracking complet: client, mașină, categorie, mecanic responsabil
- Gestionarea pieselor utilizate și calculul costurilor
- Stări multiple: în așteptare, în lucru, finalizat, livrat, anulat

### 👥 Gestionarea Clienților
- Baza de date completă cu clienți
- Istoric lucrări per client
- Date de contact și informații mașini

### 🔩 Gestionarea Pieselor
- Inventar cu stocuri în timp real
- Tracking utilizare piese în lucrări
- Categorii și prețuri

### 📊 Dashboard & Statistici
- Grafice interactive cu Chart.js
- Venituri pe perioade
- Statistici per mecanic și tip reparație
- Indicatori cheie de performanță

### 🔐 Autentificare Securizată
- Sistem de autentificare prin PIN pentru admin
- Sesiuni cu timeout automat
- Protecție împotriva atacurilor brute force

### 📱 Design Responsive
- Interfață modernă cu TailwindCSS
- Compatibil desktop, tabletă, mobil
- Mod întunecat/luminos

### 🌐 Funcționalități Avansate
- Căutare și filtrare avansată
- Export PDF/CSV
- Cache offline cu sincronizare
- Notificări toast

## 🛠️ Tehnologii Utilizate

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: TailwindCSS (Play CDN)
- **Backend/Database**: Supabase
- **Charts**: Chart.js
- **Export**: jsPDF
- **Icons**: Font Awesome

## 📋 Cerințe de Sistem

- Browser modern (Chrome, Firefox, Safari, Edge)
- Conexiune la internet pentru sincronizare
- Cont Supabase gratuit

## ⚙️ Setup și Instalare

### 1. Clonează Proiectul

```bash
git clone https://github.com/yourusername/automarga-crm.git
cd automarga-crm
```

### 2. Configurează Supabase

#### 2.1 Creează un Proiect Supabase

1. Mergi la [supabase.com](https://supabase.com)
2. Creează un cont gratuit
3. Creează un proiect nou
4. Notează **URL-ul proiectului** și **cheia API anonimă**

#### 2.2 Configurează Baza de Date

1. În dashboard-ul Supabase, mergi la **SQL Editor**
2. Rulează script-ul din `database/setup.sql` (vezi secțiunea următoare)

#### 2.3 Actualizează Configurația

1. Deschide `js/config/supabase.js`
2. Înlocuiește valorile:

```javascript
const supabaseUrl = 'SUPABASE_URL_TAU_AICI';
const supabaseKey = 'SUPABASE_ANON_KEY_AICI';
```

### 3. Script SQL pentru Baza de Date

Rulează următorul script în **SQL Editor** din Supabase:

```sql
-- Creează tabelele pentru AutoMarga CRM

-- Tabelul pentru clienți
CREATE TABLE clienti (
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
CREATE TABLE mecanici (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nume VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    email VARCHAR(255),
    specializare VARCHAR(255),
    data_angajare DATE,
    activ BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru piese
CREATE TABLE piese (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nume VARCHAR(255) NOT NULL,
    cod_piesa VARCHAR(100),
    categorie VARCHAR(100),
    pret_unitar DECIMAL(10,2),
    stoc INTEGER DEFAULT 0,
    unitate_masura VARCHAR(20) DEFAULT 'buc',
    furnizor VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru lucrări
CREATE TABLE lucrari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numar_lucrare VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clienti(id) ON DELETE CASCADE,
    mecanic_id UUID REFERENCES mecanici(id),
    
    -- Informații mașină
    numar_inmatriculare VARCHAR(20),
    marca VARCHAR(100),
    model VARCHAR(100),
    an_fabricatie INTEGER,
    
    -- Detalii lucrare
    categorie VARCHAR(100),
    descriere TEXT,
    observatii TEXT,
    
    -- Date și stare
    data_intrare TIMESTAMP DEFAULT NOW(),
    data_finalizare TIMESTAMP,
    data_livrare TIMESTAMP,
    stare VARCHAR(50) DEFAULT 'in_asteptare',
    
    -- Costuri
    cost_manopera DECIMAL(10,2) DEFAULT 0,
    cost_piese DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru piesele folosite în lucrări
CREATE TABLE lucrari_piese (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lucrare_id UUID REFERENCES lucrari(id) ON DELETE CASCADE,
    piesa_id UUID REFERENCES piese(id) ON DELETE CASCADE,
    cantitate INTEGER NOT NULL,
    pret_unitar DECIMAL(10,2) NOT NULL,
    pret_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelul pentru setări
CREATE TABLE setari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cheie VARCHAR(100) UNIQUE NOT NULL,
    valoare TEXT,
    descriere TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserează setările implicite
INSERT INTO setari (cheie, valoare, descriere) VALUES
('admin_pin', '12345', 'PIN-ul administratorului'),
('nume_service', 'AutoMarga Service', 'Numele service-ului'),
('adresa_service', '', 'Adresa service-ului'),
('telefon_service', '', 'Telefonul service-ului'),
('email_service', '', 'Email-ul service-ului');

-- Creează indecși pentru performanță
CREATE INDEX idx_lucrari_client ON lucrari(client_id);
CREATE INDEX idx_lucrari_mecanic ON lucrari(mecanic_id);
CREATE INDEX idx_lucrari_data ON lucrari(data_intrare);
CREATE INDEX idx_lucrari_stare ON lucrari(stare);
CREATE INDEX idx_lucrari_piese_lucrare ON lucrari_piese(lucrare_id);
CREATE INDEX idx_lucrari_piese_piesa ON lucrari_piese(piesa_id);

-- Trigger pentru actualizarea updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplică trigger-ul pe toate tabelele
CREATE TRIGGER update_clienti_updated_at BEFORE UPDATE ON clienti FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mecanici_updated_at BEFORE UPDATE ON mecanici FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_piese_updated_at BEFORE UPDATE ON piese FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lucrari_updated_at BEFORE UPDATE ON lucrari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_setari_updated_at BEFORE UPDATE ON setari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pentru generarea automată a numărului de lucrare
CREATE OR REPLACE FUNCTION generate_numar_lucrare()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numar_lucrare IS NULL OR NEW.numar_lucrare = '' THEN
        NEW.numar_lucrare := 'LUC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('numar_lucrare_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Creează secvența pentru numerele de lucrare
CREATE SEQUENCE numar_lucrare_seq START 1;

-- Aplică trigger-ul
CREATE TRIGGER generate_numar_lucrare_trigger BEFORE INSERT ON lucrari FOR EACH ROW EXECUTE FUNCTION generate_numar_lucrare();

-- Funcție pentru actualizarea automată a costului total
CREATE OR REPLACE FUNCTION update_total_cost()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_cost := COALESCE(NEW.cost_manopera, 0) + COALESCE(NEW.cost_piese, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lucrari_total_cost BEFORE INSERT OR UPDATE ON lucrari FOR EACH ROW EXECUTE FUNCTION update_total_cost();
```

### 4. Pornește Aplicația

1. Deschide `index.html` într-un server web local
2. Pentru dezvoltare, poți folosi:
   - **Live Server** în VS Code
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx serve .`

### 5. Prima Conectare

1. Deschide aplicația în browser
2. Folosește PIN-ul implicit: **12345**
3. Schimbă PIN-ul din menu → Setări

## 🗃️ Structura Proiectului

```
automarga-crm/
├── index.html                 # Pagina principală
├── css/
│   └── styles.css            # Stiluri custom
├── js/
│   ├── config/
│   │   └── supabase.js       # Configurația Supabase
│   ├── modules/
│   │   ├── auth.js           # Autentificare
│   │   ├── dashboard.js      # Dashboard
│   │   ├── lucrari.js        # Managementul lucrărilor
│   │   ├── clienti.js        # Managementul clienților
│   │   ├── piese.js          # Managementul pieselor
│   │   ├── notifications.js  # Notificări toast
│   │   ├── storage.js        # Cache & storage
│   │   ├── search.js         # Căutare și filtrare
│   │   └── export.js         # Export PDF/CSV
│   ├── utils/
│   │   ├── constants.js      # Constante
│   │   ├── helpers.js        # Funcții helper
│   │   └── modal.js          # Gestionarea modal-urilor
│   └── app.js                # Aplicația principală
├── assets/
│   └── demo-data.json        # Date demo
└── README.md                 # Această documentație
```

## 🎯 Utilizare

### Login Admin
- PIN implicit: **12345**
- Schimbă PIN-ul din menu utilizator → Setări

### Gestionarea Lucrărilor
1. **Dashboard** → vezi statistici generale
2. **Lucrări** → adaugă/editează/șterge lucrări
3. **Clienți** → gestionează baza de date clienți
4. **Piese** → gestionează inventarul

### Căutare și Filtrare
- Caută după număr înmatriculare, nume client, telefon
- Filtrează după stare, categorie, mecanic
- Sortează după orice coloană

### Export Date
- Export lucrări în PDF sau CSV
- Generare rapoarte personalizate

## 🔧 Configurare Avansată

### Modificarea PIN-ului Implicit

```sql
UPDATE setari SET valoare = 'NOUL_PIN' WHERE cheie = 'admin_pin';
```

### Adăugarea de Mecanici

```sql
INSERT INTO mecanici (nume, telefon, specializare) VALUES
('Ion Popescu', '0721234567', 'Motor'),
('Maria Ionescu', '0731234567', 'Caroserie');
```

### Adăugarea de Piese

```sql
INSERT INTO piese (nume, cod_piesa, categorie, pret_unitar, stoc) VALUES
('Ulei motor 5W-30', 'UL001', 'Uleiuri', 45.50, 20),
('Filtru aer', 'FA001', 'Filtre', 25.00, 15);
```

## 🚨 Securitate

### Setări Recomandate Supabase

1. **Row Level Security (RLS)**:
   - Activează RLS pe toate tabelele
   - Creează politici pentru acces controlat

2. **API Keys**:
   - Folosește doar cheia anonimă în frontend
   - Nu expune niciodată service key-ul

3. **CORS**:
   - Configurează domeniul aplicației în setările Supabase

### Politici RLS Recomandate

```sql
-- Politica pentru tabelul lucrari (exemplu)
CREATE POLICY "Enable all operations for authenticated users" ON lucrari
FOR ALL USING (true);

-- Repetă pentru toate tabelele
```

## 📱 Compatibilitate Browser

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🐛 Depanare Probleme Comune

### Eroare de conexiune Supabase
1. Verifică URL-ul și cheia API
2. Verifică setările CORS în Supabase
3. Verifică console-ul browserului pentru erori

### Problema cu PIN-ul
1. Verifică tabelul `setari` în Supabase
2. Resetează PIN-ul cu query SQL

### Probleme de loading
1. Verifică console-ul pentru erori JavaScript
2. Asigură-te că toate CDN-urile se încarcă

## 📈 Dezvoltare Viitoare

- [ ] Notificări push
- [ ] Integare cu sisteme de plată
- [ ] API pentru aplicații mobile
- [ ] Backup automat
- [ ] Multi-tenant pentru mai multe service-uri

## 🤝 Contribuție

1. Fork proiectul
2. Creează o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit modificările (`git commit -m 'Add some AmazingFeature'`)
4. Push la branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## 📄 Licență

Acest proiect este sub licența MIT. Vezi fișierul `LICENSE` pentru detalii.

## 📞 Suport

Pentru întrebări sau probleme:
- Deschide un [Issue](https://github.com/yourusername/automarga-crm/issues)
- Email: support@automarga.com

## 🙏 Mulțumiri

- [Supabase](https://supabase.com) pentru backend gratuit
- [TailwindCSS](https://tailwindcss.com) pentru styling
- [Chart.js](https://www.chartjs.org) pentru grafice
- [Font Awesome](https://fontawesome.com) pentru iconuri

---

**AutoMarga CRM** - Simplifică gestionarea service-ului tău auto! 🚗✨