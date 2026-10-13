# Církevní Silvestr & Akce mládeže – Multi-Event Registrace a QR Odbavení

Moderní webová aplikace pro online registraci, generování vstupenek a bleskové QR odbavení účastníků akcí pořádaných mládeží děkanátu Prostějov ([mladez.dpv.cz](https://mladez.dpv.cz)).

Systém je navržen jako **obecný multi-event ticketing**, kde je výchozí akcí **"Církevní Silvestr"**, ale organizátoři mohou v administraci snadno vytvářet další akce (např. *Večery chval, Diecézní setkání mládeže, tábory, ples mládeže*), filtrovat data a přepínat, na kterou akci se u vchodu zrovna skenuje.

Všechny akce jsou typicky **zdarma** a hlavním cílem aplikace je **zcela eliminovat fronty u vstupu** – účastník se předem zaregistruje, obdrží osobní QR kód a u vchodu je odbaven během 3 vteřin přímo z displeje mobilu.

---

## 🚀 Klíčové funkce

### 1. Multi-Event architektura & Správa událostí
- **Dynamická tvorba událostí:** Organizátor může v rozhraní `/checkin` kliknout na **"Správa akcí"** a vytvořit novou událost (Název, Datum a čas, Místo konání, URL slug, Popis).
- **Aktivace / Pozastavení:** Každou akci lze jedním kliknutím aktivovat nebo pozastavit pro veřejné registrace.
- **Přepínač skenování na terminálu:** Organizátor u vchodu volí v horní liště akci, na kterou zrovna účastníky vpouští (např. *Církevní Silvestr 2025* nebo *Večer chval*).
- **Ochrana proti záměně akcí (Cross-event safety):** Pokud účastník ukáže QR kód z jiné události, systém okamžitě zobrazí varování:  
  `⚠️ POZOR: KÓD PRO JINOU UDÁLOST! Tento kód je platný pro akci "Církevní Silvestr", nikoli pro vybranou akci "Večer chval"!`  
  Organizátor může jedním kliknutím přepnout na dotyčnou akci a účastníka odbavit.

### 2. Veřejná Homepage (`/`)
- Moderní, přátelský design laděný do stylu mládeže děkanátu Prostějov.
- Klíčové informace o hlavní akci: program večera, místo konání, bezplatný vstup, co vzít s sebou.
- Dynamický přehled otevřených akcí: Pokud je aktivních více akcí, zobrazí se interaktivní kalendář s přímými odkazy na registrace (`/registrace?event=slug`).
- Výrazné CTA prvky pro eliminaci front u vstupu.

### 3. Registrační formulář (`/registrace`)
- Výběr akce (pokud je otevřeno více akcí) nebo předvyplnění přes URL parametr `?event=slug`.
- Validace formuláře přes `react-hook-form` + `@hookform/resolvers` + `zod`.
- Pole: Jméno, Příjmení, E-mail, Bydliště / Farnost.
- Uložení záznamu do databáze ve stavu `REGISTERED`.
- Vygenerování unikátního QR kódu (`qrcode`).
- Odeslání potvrzovacího e-mailu s dynamickým názvem akce a QR kódem přes **Resend SDK** a **@react-email/components**.

### 4. Děkovací stránka / Vstupenka (`/registrace/uspech?id=...`)
- Zobrazení údajů účastníka a velkého přehledného QR kódu na obrazovce.
- Možnost **stáhnout QR kód jako obrázek (PNG)** do mobilu.
- Tlačítko **uložit do kalendáře (.ics)** s přesným názvem a místem akce.
- Konfetová animace (`canvas-confetti`).

### 5. Odbavovací terminál u vstupu (`/checkin`)
- **Chráněná zóna:** Přístup pouze pro organizátory po zadání hesla (zabezpečeno přes podepsanou session cookie via `jose`).
- **Kamerový skener:** Bleskové čtení QR kódů přímo v prohlížeči (`html5-qrcode`) s přepínáním přední/zadní kamery na mobilu.
- **Okamžitá zvuková a vizuální odezva (Web Audio API):**
  - 🟢 **ZELENÁ (Úspěch):** *"Platná registrace: [Jméno Příjmení], vítejte! Můžou jít."* + harmonický tón (změna na stav `ATTENDED`).
  - 🔴 **ČERVENÁ (Varování):** *"POZOR: Již uplatněno! Odbaveno v [čas]."* + varovný signál.
  - 🟠 **ORANŽOVÁ/ŽLUTÁ (Jiná akce):** *"POZOR: Kód pro jinou událost!"* + varovný signál a možnost rychlého přepnutí.
  - 🟡 **ŠEDÁ/ŽLUTÁ (Chyba):** *"Nenalezeno / Neplatný kód."* + hluboký tón.
- **Záložní ruční odbavení:** Vyhledávání podle jména, e-mailu nebo ID pro případ vybitého telefonu.
- **Statistika v reálném čase:** Celkem registrováno, odbaveno, zbývá dorazit a míra účasti pro vybranou akci i celkově.
- **Stornování:** Možnost vrátit / stornovat omylem odbaveného účastníka.

---

## 🛠 Technický stack

- **Framework:** Next.js 16 (App Router, Server Actions, TypeScript)
- **Komponenty & Styling:** shadcn/ui architektura (`Button`, `Card`, `Badge`, `Input`, `Alert`), Tailwind CSS v4 + Lucide React ikony
- **Linter & Formatter:** Biome (`@biomejs/biome`)
- **Formuláře & validace:** `react-hook-form`, `@hookform/resolvers`, `zod`
- **Databáze & ORM:** Prisma ORM (`@prisma/client`, `prisma`) s PostgreSQL (Vercel Postgres / Neon)
  - Obsahuje automatický in-memory fallback pro vývoj bez připojené lokální databáze.
- **E-maily:** Resend SDK (`resend`) + `@react-email/components`
- **Generování QR kódů:** `qrcode`
- **Skenování QR kódů:** `html5-qrcode`
- **Autentizace:** Bezpečná cookie session podepsaná přes `jose`
- **Zvukové efekty:** Web Audio API (prostorová syntéza bez externích zvukových souborů)

---

## 📋 Konfigurace prostředí (`.env`)

Vytvořte soubor `.env` (vycházejte z `.env.example`):

```bash
# Databáze: Vercel Postgres / Neon connection string
POSTGRES_PRISMA_URL="postgresql://user:password@host/dbname?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host/dbname?sslmode=require"

# Resend API pro e-maily (https://resend.com/api-keys)
# V lokálním devu bez klíče se e-maily simulují a logují do konzole
RESEND_API_KEY="re_123456789"
EMAIL_FROM="Mládež DPV <onboarding@resend.dev>"

# Heslo pro vstup do organizátorské zóny /checkin
ADMIN_PASSWORD="silvestr-prostejov"

# Tajný klíč pro podepisování session cookies (min. 32 znaků)
AUTH_SECRET="dev-secret-key-for-silvestr-checkin-session-minimum-32-chars"

# Veřejná URL aplikace
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 💻 Lokální spuštění

1. **Instalace závislostí:**
   ```bash
   pnpm install
   ```

2. **Generování Prisma klienta:**
   ```bash
   pnpm prisma generate
   ```

3. **Kontrola kvality kódu (Biome):**
   ```bash
   pnpm biome check
   ```

4. **Spuštění vývojového serveru:**
   ```bash
   pnpm dev
   ```

5. Otevřete [http://localhost:3000](http://localhost:3000) (veřejný web) nebo [http://localhost:3000/checkin](http://localhost:3000/checkin) (odbavovací terminál pro organizátory, výchozí heslo v `.env` je `silvestr-prostejov`).

---

## 🚢 Nasazení na Vercel

1. Nahrajte projekt na GitHub.
2. Vytvořte nový projekt na [Vercel](https://vercel.com).
3. V záložce **Storage** přidejte **Vercel Postgres** nebo Neon. Proměnná `POSTGRES_PRISMA_URL` se propojí automaticky.
4. Nastavte v **Environment Variables**:
   - `ADMIN_PASSWORD` (heslo pro organizátory u vchodu)
   - `AUTH_SECRET` (náhodný bezpečný řetězec min. 32 znaků)
   - `RESEND_API_KEY` (váš API klíč z Resend)
   - `EMAIL_FROM` (ověřená doména odesílatele)
   - `NEXT_PUBLIC_APP_URL` (doména na Vercelu)
5. Po prvním nasazení spusťte `pnpm prisma db push` pro aplikaci tabulek v databázi.
