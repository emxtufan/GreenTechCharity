# Panoul de cereri GREENTECH Charity

Panoul este disponibil la `/admin/`. Formularele publice trimit cererile la
`/api/submissions`, iar administrarea lor se face prin `/api/admin`.

Nu este folosita o baza de date. Cererile sunt pastrate intr-un fisier JSON
privat pe server, configurat prin `SUBMISSIONS_FILE`.

## Configurare

1. Copiaza `.env.example` intr-un fisier numit `.env`.
2. Completeaza variabilele:

   - `ADMIN_USERNAME`: utilizatorul cu care intri in `/admin/`;
   - `ADMIN_PASSWORD`: o parola unica de minimum 10 caractere;
   - `ADMIN_SESSION_SECRET`: secret aleator de minimum 32 de caractere, folosit
     pentru semnarea sesiunii de administrare;
   - `SUBMISSION_HASH_SECRET`: alt secret aleator de minimum 32 de caractere,
     folosit pentru protectia anti-abuz;
   - `SUBMISSIONS_FILE`: calea catre fisierul privat cu cereri. Valoarea
     recomandata este `storage/form-submissions.json`;
   - `PORT` si `HOST`: portul si interfata pe care asculta serverul Node.

Fisierul `.env` este exclus din Git. Nu introduce parola sau secretele in
HTML, JavaScript public ori intr-un commit.

## Rulare locala

```bash
npm run dev
```

Deschide site-ul la `http://localhost:3000`, iar panoul la
`http://localhost:3000/admin/`.

## Rulare in productie

```bash
npm run build
npm start
```

Aplicatia trebuie publicata pe un server Node cu disc persistent. Un mediu
serverless cu sistem de fisiere temporar nu poate pastra permanent cererile.
Directorul `storage/` nu este servit public de aplicatie.

Fa periodic backup fisierului configurat in `SUBMISSIONS_FILE`. La restaurare,
opreste serverul, inlocuieste fisierul cu copia valida si porneste din nou
aplicatia.

## Ce se salveaza

Sunt centralizate cererile de donatie, voluntariat, parteneriat, contact si
newsletter. Administratorul poate cauta si filtra cererile, le poate vedea
campurile si poate seta starea la `noua`, `in_lucru`, `contactata`,
`finalizata` sau `spam`, impreuna cu note interne.
