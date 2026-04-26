<!--
  Documento redatto in buona fede come punto di partenza, adattato
  al funzionamento reale di TriviaMore.
-->

# Informativa sulla Privacy

**Versione:** 2026-04-24
**Ultimo aggiornamento:** 24 aprile 2026

La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che visitano o utilizzano il sito **TriviaMore** (di seguito, "il Servizio"), ai sensi del Regolamento (UE) 2016/679 ("GDPR") e del D.lgs. 196/2003 ("Codice Privacy") come modificato dal D.lgs. 101/2018.

## 1. Titolare del trattamento

Titolare del trattamento è **Marin Cervinschi**, contattabile all'indirizzo email **privacy@trivia-more.it**.

Dato il carattere personale e non commerciale del progetto, non è stato nominato un Responsabile della Protezione dei Dati (DPO).

## 2. Dati personali trattati

### 2.1 Dati forniti volontariamente

Al momento della registrazione con email e password, l'utente fornisce:

- **nome** (obbligatorio);
- **indirizzo email** (obbligatorio);
- **password** (conservata in forma cifrata tramite Supabase Auth, non accessibile al Titolare).

Se la registrazione avviene tramite provider OAuth (GitHub, Google), il Titolare riceve dal provider:

- nome e indirizzo email dell'account;
- URL dell'immagine profilo, se resa disponibile dal provider.

Successivamente, l'utente può modificare il proprio nome e l'URL dell'immagine profilo dalla pagina Impostazioni.

### 2.2 Dati raccolti automaticamente durante l'utilizzo

Durante l'utilizzo del Servizio vengono memorizzati:

- i corsi seguiti, i preferiti e le classi salvate;
- i risultati delle sessioni di quiz e di studio con flashcard;
- le eventuali richieste di contenuti inviate al team di moderazione.

### 2.3 Dati di accettazione dei documenti legali

Ogni accettazione dei Termini e Condizioni e dell'Informativa Privacy viene registrata con:

- identificativo dell'utente;
- versione del documento accettato;
- data e ora di accettazione;
- indirizzo IP pubblico e user agent del client.

Questa traccia costituisce registro di trattamento e viene conservata per il tempo in cui l'account è attivo, a dimostrazione del consenso prestato.

### 2.4 Dati tecnici e analitici

Informazioni tecniche sono raccolte in forma aggregata tramite servizi di analisi (vedi sezione "Cookie e tecnologie simili" e la [Cookie Policy](/legal/cookies)). Tali informazioni non sono utilizzate per profilazione individuale.

## 3. Finalità e basi giuridiche del trattamento

| Finalità | Base giuridica |
|---|---|
| Creazione e gestione dell'account, erogazione del Servizio | Art. 6, par. 1, lett. b) GDPR — esecuzione del contratto |
| Conservazione del registro di accettazione dei documenti legali | Art. 6, par. 1, lett. c) GDPR — obbligo legale di rendicontabilità (art. 7 GDPR) |
| Analisi statistiche aggregate tramite Vercel Analytics e Speed Insights | Art. 6, par. 1, lett. a) GDPR — consenso, prestato tramite banner cookie |
| Sicurezza del Servizio, prevenzione di abusi | Art. 6, par. 1, lett. f) GDPR — legittimo interesse |
| Pubblicazione nella futura pagina Contributori | Art. 6, par. 1, lett. a) GDPR — consenso, prestato tramite apposito interruttore nelle Impostazioni |

## 4. Modalità di trattamento

I dati sono trattati con strumenti automatizzati, in forma cifrata in transito (TLS) e a riposo. L'accesso ai dati personali è limitato al Titolare e, per finalità operative e di moderazione, agli utenti con ruolo amministrativo.

## 5. Destinatari dei dati (Responsabili del trattamento)

Per erogare il Servizio il Titolare si avvale dei seguenti responsabili esterni, selezionati tra fornitori che offrono idonee garanzie in materia di protezione dei dati:

| Fornitore | Ruolo | Dati trattati | Sede |
|---|---|---|---|
| **Supabase Inc.** | Hosting del database, autenticazione | Tutti i dati personali dell'account e dell'utilizzo | Stati Uniti (con applicazione delle Standard Contractual Clauses) |
| **Vercel Inc.** | Hosting dell'applicazione, Analytics, Speed Insights | Dati di navigazione aggregati, log di richiesta | Stati Uniti (SCC) |
| **GitHub, Inc.** | Provider OAuth opzionale | Identificativo e email dell'account collegato | Stati Uniti (SCC) |
| **Google LLC** | Provider OAuth opzionale | Identificativo e email dell'account collegato | Stati Uniti (SCC) |
| **Infisical** | Gestione sicura delle credenziali di servizio | Non tratta dati degli utenti finali | Istanza self-hosted sotto il controllo del Titolare |

I dati **non vengono venduti** né ceduti a terzi per finalità commerciali o di marketing.

## 6. Trasferimenti extra-UE

Alcuni fornitori (Supabase, Vercel, GitHub, Google) hanno sede negli Stati Uniti. I trasferimenti sono tutelati dalle Clausole Contrattuali Standard approvate dalla Commissione Europea e, ove applicabile, dal Data Privacy Framework UE-USA.

## 7. Tempi di conservazione

- **Dati dell'account attivo:** fino alla richiesta di cancellazione da parte dell'utente.
- **Dati di utilizzo (sessioni, progressi) dopo l'anonimizzazione:** conservati a tempo indeterminato in forma non riconducibile alla persona, per finalità statistiche (art. 17, par. 3, lett. d) GDPR).
- **Registro di accettazione dei documenti legali:** conservato finché l'account è attivo; le versioni più recenti restano disponibili come prova del consenso prestato.
- **Log tecnici di sicurezza:** conservati per il tempo strettamente necessario (tipicamente 30 giorni).

## 8. Diritti dell'interessato

In qualunque momento l'utente può esercitare i diritti riconosciuti dagli artt. 15-22 GDPR:

- **accesso** ai propri dati personali (art. 15);
- **rettifica** di dati inesatti (art. 16);
- **cancellazione** dei dati (art. 17) — vedi sezione 10 dei Termini e Condizioni per le modalità di anonimizzazione;
- **limitazione** del trattamento (art. 18);
- **portabilità** dei dati in formato strutturato (art. 20);
- **opposizione** al trattamento fondato sul legittimo interesse (art. 21);
- **revoca del consenso** prestato per finalità analitiche o di visibilità pubblica, in ogni momento e senza conseguenze (art. 7, par. 3).

Le richieste possono essere inoltrate all'indirizzo **privacy@trivia-more.it** e ricevono risposta entro un mese.

## 9. Diritto di reclamo

L'interessato ha il diritto di proporre reclamo all'Autorità di controllo competente (per l'Italia, il **Garante per la Protezione dei Dati Personali**, www.garanteprivacy.it).

## 10. Cookie e tecnologie simili

I cookie e le tecnologie analoghe utilizzate sul Servizio sono descritte nella [Cookie Policy](/legal/cookies). I cookie analitici sono installati solo previo consenso prestato tramite l'apposito banner; tale consenso può essere revocato in qualunque momento dal pulsante "Preferenze cookie" presente nel piè di pagina.

## 11. Sicurezza

Il Titolare adotta misure tecniche e organizzative ragionevoli per proteggere i dati, tra cui: cifratura TLS, cifratura a riposo sul database, autenticazione forte per le credenziali di servizio, controllo degli accessi amministrativi, aggiornamento costante delle dipendenze software.

Nonostante tali misure, nessun sistema informatico può essere considerato totalmente sicuro: l'utente è invitato a utilizzare password robuste e a non riutilizzare credenziali tra servizi diversi.

## 12. Minori

Il Servizio non è rivolto a minori di 14 anni. Il trattamento dei dati personali di minori di età compresa tra 14 e 18 anni avviene nei limiti previsti dalla normativa italiana; in caso di dubbi sull'età dell'interessato, il Titolare si riserva la facoltà di richiedere il consenso parentale o di sospendere l'account.

## 13. Modifiche all'informativa

La presente informativa può essere aggiornata. Le modifiche sostanziali sono comunicate agli utenti registrati tramite la schermata di ri-accettazione al successivo accesso. La versione corrente è sempre consultabile all'indirizzo `/legal/privacy` e riporta in apertura la data dell'ultimo aggiornamento.
