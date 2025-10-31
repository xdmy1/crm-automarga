# Setup Rapid AutoMarga CRM

## Problemă curentă
Aplicația afișează pagina albă din cauza unor probleme de inițializare.

## Soluție rapidă pentru testare

### 1. Configurează Supabase

1. Mergi la [supabase.com](https://supabase.com) și creează un cont gratuit
2. Creează un proiect nou
3. În dashboard-ul Supabase, mergi la **Settings → API**
4. Copiază **URL** și **anon key**

### 2. Actualizează configurația

Editează fișierul `js/config/supabase.js` și înlocuiește valorile:

```javascript
const supabaseUrl = 'URL_TAU_SUPABASE_AICI';
const supabaseKey = 'ANON_KEY_TAU_AICI';
```

### 3. Configurează baza de date

1. În dashboard-ul Supabase, mergi la **SQL Editor**
2. Rulează script-ul din `database/setup.sql`

### 4. Testează aplicația

1. Deschide `index.html` într-un server local:
   ```bash
   python3 -m http.server 8000
   ```
2. Mergi la `http://localhost:8000`
3. Folosește PIN-ul: **12345**

## Debug probleme

Dacă aplicația nu funcționează:

1. Deschide Console-ul browserului (F12)
2. Verifică erorile JavaScript
3. Verifică conexiunea la Supabase

## Funcționalități implementate

✅ **Layout și sidebar** - Corectat poziționarea
✅ **Modulul clienți** - Eliminat email și adresă
✅ **Modulul piese** - Complet funcțional
✅ **Modal lucrări** - Funcțional cu asociere client
✅ **Autentificare** - Doar prin PIN pentru admin
✅ **Asociere automată** - Client-lucrare cu buton rapid

## Următorii pași

1. Configurează Supabase
2. Testează aplicația
3. Raportează probleme specifice în console