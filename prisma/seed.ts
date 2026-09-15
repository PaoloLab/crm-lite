import { prisma } from "../src/lib/prisma";

// ---------------------------------------------------------------------------
// PRNG seedato (mulberry32) — dataset riproducibile: rilanciando il seed
// ottieni sempre la stessa distribuzione di deal/activity, comodo per
// confrontare la dashboard prima/dopo una modifica.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260915);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function weightedPick<T>(items: [T, number][]): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    if (r < w) return item;
    r -= w;
  }
  return items[items.length - 1][0];
}
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  const NOW = new Date();

  // -------------------------------------------------------------------
  // Roles
  // -------------------------------------------------------------------
  const adminRole = await prisma.role.create({
    data: { description: "Amministratore", level: 1 },
  });

  const sellerRole = await prisma.role.create({
    data: { description: "Venditore", level: 2 },
  });

  // -------------------------------------------------------------------
  // Users: 1 admin + 3 venditori
  // Password placeholder: da sostituire a mano con hash bcrypt reali.
  // -------------------------------------------------------------------
  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: "TEMP_PLAIN_TEXT", // sistemiamo con bcrypt al punto 6.3
      name: "Admin",
      surname: "System",
      birthDate: new Date("1990-01-01"),
      roleId: adminRole.roleId,
    },
  });

  const sellerGiulia = await prisma.user.create({
    data: {
      username: "giulia.bianchi",
      passwordHash: "TEMP_PLAIN_TEXT",
      name: "Giulia",
      surname: "Bianchi",
      birthDate: new Date("1992-04-14"),
      roleId: sellerRole.roleId,
    },
  });

  const sellerMarco = await prisma.user.create({
    data: {
      username: "marco.rinaldi",
      passwordHash: "TEMP_PLAIN_TEXT",
      name: "Marco",
      surname: "Rinaldi",
      birthDate: new Date("1988-11-02"),
      roleId: sellerRole.roleId,
    },
  });

  const sellerFrancesca = await prisma.user.create({
    data: {
      username: "francesca.russo",
      passwordHash: "TEMP_PLAIN_TEXT",
      name: "Francesca",
      surname: "Russo",
      birthDate: new Date("1995-07-23"),
      roleId: sellerRole.roleId,
    },
  });

  const sellers = [sellerGiulia, sellerMarco, sellerFrancesca];
  // Deal/Activity generati per tutti e 4 gli utenti (admin incluso, come
  // "venditore" ai fini dei dati demo) — l'admin li vede comunque tutti.
  const dataUsers = [adminUser, ...sellers];

  // -------------------------------------------------------------------
  // Lookup tables
  // -------------------------------------------------------------------
  await prisma.dealState.createMany({
    data: [
      { code: "NEW", slug: "nuovo", label: "Nuovo", sequence: 1 },
      { code: "PROPOSAL", slug: "proposta", label: "Proposta", sequence: 2 },
      { code: "WON", slug: "vinto", label: "Vinto", sequence: 3 },
      { code: "LOST", slug: "perso", label: "Perso", sequence: 4 },
    ],
  });

  await prisma.activityType.createMany({
    data: [
      { code: "CALL", label: "Chiamata" },
      { code: "EMAIL", label: "Email" },
      { code: "MEETING", label: "Meeting" },
    ],
  });

  const dealStates = await prisma.dealState.findMany();
  const activityTypes = await prisma.activityType.findMany();

  const dealStateBySlug = Object.fromEntries(
    dealStates.map((s) => [s.slug, s.dealStateId])
  );
  const activityTypeByCode = Object.fromEntries(
    activityTypes.map((t) => [t.code, t.activityTypeId])
  );

  // -------------------------------------------------------------------
  // Companies (12 originali + 3 nuove per varietà)
  // -------------------------------------------------------------------
  const corteVinicola = await prisma.company.create({
    data: { name: "Corte Vinicola Srl", address: "Via Roma 12, Verona", piva: "IT01234567890" },
  });
  const vetraStudio = await prisma.company.create({
    data: { name: "Vetra Studio", address: "Corso Italia 45, Milano", piva: "IT09876543210" },
  });
  const meridianaGroup = await prisma.company.create({
    data: { name: "Meridiana Group", address: "Via Garibaldi 3, Torino", piva: "IT11223344556" },
  });
  const nordikaSrl = await prisma.company.create({
    data: { name: "Nordika SRL", address: "Via delle Industrie 8, Bergamo", piva: "IT66778899001" },
  });
  const lumenInteriors = await prisma.company.create({
    data: { name: "Lumen Interiors", address: "Piazza Duomo 1, Firenze", piva: "IT55443322110" },
  });
  const orsoLogistics = await prisma.company.create({
    data: { name: "Orso Logistics", address: "Via Po 22, Torino", piva: "IT99887766554" },
  });
  const altairConsulting = await prisma.company.create({
    data: { name: "Altair Consulting", address: "Via Manzoni 9, Bologna", piva: "IT12345678901" },
  });
  const ferroAssociati = await prisma.company.create({
    data: { name: "Ferro & Associati", address: "Via Emilia 40, Modena", piva: "IT23456789012" },
  });
  const boscoVerde = await prisma.company.create({
    data: { name: "Bosco Verde Srl", address: "Via dei Pini 5, Trento", piva: "IT34567890123" },
  });
  const querciaInnovazione = await prisma.company.create({
    data: { name: "Quercia Innovazione", address: "Via Newton 18, Padova", piva: "IT45678901234" },
  });
  const stellaMarinaHotels = await prisma.company.create({
    data: { name: "Stella Marina Hotels", address: "Lungomare Colombo 2, Genova", piva: "IT56789012345" },
  });
  const ponteNuovoCostruzioni = await prisma.company.create({
    data: { name: "Ponte Nuovo Costruzioni", address: "Via dei Cantieri 30, Brescia", piva: "IT67890123456" },
  });
  const auroraDigitale = await prisma.company.create({
    data: { name: "Aurora Digitale Srl", address: "Via Tortona 33, Milano", piva: "IT78901234567" },
  });
  const piemonteChimica = await prisma.company.create({
    data: { name: "Piemonte Chimica Spa", address: "Corso Francia 88, Torino", piva: "IT89012345678" },
  });
  const adriaticaTrasporti = await prisma.company.create({
    data: { name: "Adriatica Trasporti Srl", address: "Via del Porto 14, Ancona", piva: "IT90123456789" },
  });

  // -------------------------------------------------------------------
  // Contacts (15 originali + 3 nuovi per le nuove company)
  // -------------------------------------------------------------------
  const contactCorte = await prisma.contact.create({
    data: { name: "Marco", surname: "Bianchi", companyId: corteVinicola.companyId },
  });
  const contactVetra = await prisma.contact.create({
    data: { name: "Elena", surname: "Rossi", companyId: vetraStudio.companyId },
  });
  const contactMeridiana = await prisma.contact.create({
    data: { name: "Davide", surname: "Conti", companyId: meridianaGroup.companyId },
  });
  const contactNordika = await prisma.contact.create({
    data: { name: "Sara", surname: "Colombo", companyId: nordikaSrl.companyId },
  });
  const contactNordikaBis = await prisma.contact.create({
    data: { name: "Roberto", surname: "Fabbri", companyId: nordikaSrl.companyId },
  });
  const contactLumen = await prisma.contact.create({
    data: { name: "Luca", surname: "Ferrari", companyId: lumenInteriors.companyId },
  });
  const contactOrso = await prisma.contact.create({
    data: { name: "Anna", surname: "Greco", companyId: orsoLogistics.companyId },
  });
  const contactAltair = await prisma.contact.create({
    data: { name: "Chiara", surname: "Moretti", companyId: altairConsulting.companyId },
  });
  const contactFerro = await prisma.contact.create({
    data: { name: "Simone", surname: "Galli", companyId: ferroAssociati.companyId },
  });
  const contactBosco = await prisma.contact.create({
    data: { name: "Federica", surname: "Longo", companyId: boscoVerde.companyId },
  });
  const contactQuercia = await prisma.contact.create({
    data: { name: "Matteo", surname: "Ricci", companyId: querciaInnovazione.companyId },
  });
  const contactStella = await prisma.contact.create({
    data: { name: "Giulia", surname: "Marino", companyId: stellaMarinaHotels.companyId },
  });
  const contactPonte = await prisma.contact.create({
    data: { name: "Andrea", surname: "Costa", companyId: ponteNuovoCostruzioni.companyId },
  });
  const contactAurora = await prisma.contact.create({
    data: { name: "Silvia", surname: "Bruno", companyId: auroraDigitale.companyId },
  });
  const contactPiemonte = await prisma.contact.create({
    data: { name: "Stefano", surname: "Villani", companyId: piemonteChimica.companyId },
  });
  const contactAdriatica = await prisma.contact.create({
    data: { name: "Riccardo", surname: "Fontana", companyId: adriaticaTrasporti.companyId },
  });
  // Contatti senza azienda, per testare companyId nullable
  const contactPaolo = await prisma.contact.create({ data: { name: "Paolo", surname: "Villa", companyId: null } });
  const contactValentina = await prisma.contact.create({ data: { name: "Valentina", surname: "De Luca", companyId: null } });

  const allContacts = [
    contactCorte, contactVetra, contactMeridiana, contactNordika, contactNordikaBis,
    contactLumen, contactOrso, contactAltair, contactFerro, contactBosco,
    contactQuercia, contactStella, contactPonte, contactAurora, contactPiemonte,
    contactAdriatica, contactPaolo, contactValentina,
  ];

  // -------------------------------------------------------------------
  // Deal: 32 per utente (admin + 3 venditori) = 128 deal totali
  // -------------------------------------------------------------------
  const dealStateWeights: [string, number][] = [
    ["nuovo", 30],
    ["proposta", 30],
    ["vinto", 20],
    ["perso", 20],
  ];

  const titleTemplates = [
    "Fornitura annuale",
    "Rinnovo contratto",
    "Nuova partnership commerciale",
    "Espansione servizio",
    "Consulenza operativa",
    "Integrazione sistema",
    "Ottimizzazione processi",
    "Progetto pilota",
    "Ampliamento fornitura",
    "Revisione contrattuale",
    "Nuova commessa",
    "Supporto tecnico avanzato",
    "Migrazione piattaforma",
    "Sviluppo su misura",
    "Manutenzione annuale",
    "Formazione team interno",
    "Audit e compliance",
    "Espansione mercato estero",
    "Digitalizzazione processi",
    "Rinegoziazione tariffe",
  ];

  type DealSeed = {
    title: string;
    value: string;
    dealStateId: number;
    dateCreation: Date;
    dateLastModified: Date;
    userId: number;
    contactId: number;
  };

  const dealsToCreate: DealSeed[] = [];

  const DEALS_PER_USER = 45; // 45 x 4 utenti = 180 deal totali
  const MONTHS_BACK = 12; // deal fino a ~1 anno fa

  for (const user of dataUsers) {
    // Distribuzione stratificata: ogni deal viene assegnato a uno dei 13
    // bucket mensili (mese corrente + 12 indietro) in modo ciclico, con
    // ordine mischiato per utente. Così ogni mese ha garantiti almeno
    // alcuni deal, invece di rischiare mesi vuoti con una pura uniforme
    // su 45 campioni — utile per avere un trend leggibile nei grafici.
    const monthBuckets: number[] = [];
    for (let i = 0; i < DEALS_PER_USER; i++) {
      monthBuckets.push(i % (MONTHS_BACK + 1));
    }
    // shuffle (Fisher-Yates) per non avere sempre lo stesso ordine mese-per-mese tra utenti
    for (let i = monthBuckets.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [monthBuckets[i], monthBuckets[j]] = [monthBuckets[j], monthBuckets[i]];
    }

    for (let i = 0; i < DEALS_PER_USER; i++) {
      const contact = pick(allContacts);
      const stateSlug = weightedPick(dealStateWeights);
      const dealStateId = dealStateBySlug[stateSlug];

      // Giorno casuale dentro il mese-bucket assegnato (mese 0 = ultimi 30
      // giorni, mese 12 = 12 mesi fa), poi limitato a un minimo di 3 giorni
      // fa per lasciare spazio a dateLastModified successiva.
      const monthsAgo = monthBuckets[i];
      const daysAgoCreated = Math.max(3, monthsAgo * 30 + randInt(0, 29));
      const dateCreation = addDays(NOW, -daysAgoCreated);

      // dateLastModified coerente con lo stato
      let dateLastModified: Date;
      if (stateSlug === "vinto" || stateSlug === "perso") {
        // deal chiuso: modificato tra 5 e 60 giorni dopo la creazione,
        // ma mai dopo "oggi"
        const closeAfterDays = Math.min(randInt(5, 60), daysAgoCreated);
        dateLastModified = addDays(dateCreation, closeAfterDays);
      } else {
        // deal ancora aperto: piccolo scarto rispetto alla creazione
        const modAfterDays = Math.min(randInt(0, 15), daysAgoCreated);
        dateLastModified = addDays(dateCreation, modAfterDays);
      }

      const value = (randInt(3000, 55000) + randInt(0, 99) / 100).toFixed(2);

      dealsToCreate.push({
        title: `${pick(titleTemplates)}`,
        value,
        dealStateId,
        dateCreation,
        dateLastModified,
        userId: user.userId,
        contactId: contact.contactId,
      });
    }
  }

  await prisma.deal.createMany({ data: dealsToCreate });

  // Recupero i deal appena creati per ottenere i dealId reali.
  // L'ordine di inserimento di createMany su Postgres, in un singolo
  // statement, assegna gli id in sequenza coerente con l'array passato:
  // usiamo quindi l'ordine per dealId come corrispondenza 1:1 con dealsToCreate.
  const createdDeals = await prisma.deal.findMany({ orderBy: { dealId: "asc" } });
  const newDeals = createdDeals.slice(createdDeals.length - dealsToCreate.length);

  // -------------------------------------------------------------------
  // Activity: 0-4 per deal (peso alto su 3-4, alcuni deal restano senza)
  // -------------------------------------------------------------------
  const templatesByType: Record<"CALL" | "EMAIL" | "MEETING", string[]> = {
    CALL: [
      "Primo contatto telefonico per presentare la soluzione.",
      "Chiamata di follow-up per verificare interesse.",
      "Call di qualifica con il referente tecnico.",
      "Chiamata per chiarire dettagli tecnici e integrazione.",
      "Chiamata per concordare i prossimi passi.",
      "Richiamata per sollecitare una risposta sulla proposta.",
    ],
    EMAIL: [
      "Inviata proposta commerciale iniziale.",
      "Inviato materiale informativo e case study.",
      "Email di follow-up dopo la demo.",
      "Inviato preventivo aggiornato con sconto.",
      "Email di riepilogo dopo l'incontro.",
      "Inviata documentazione tecnica richiesta.",
    ],
    MEETING: [
      "Meeting di presentazione con il team decisionale.",
      "Demo del prodotto in sede cliente.",
      "Incontro per definire i requisiti tecnici.",
      "Meeting di chiusura per formalizzare l'accordo.",
      "Workshop congiunto per pianificare l'onboarding.",
      "Incontro di kickoff progetto.",
    ],
  };
  const typeOrder: ("CALL" | "EMAIL" | "MEETING")[] = ["CALL", "EMAIL", "MEETING"];

  const activityCountWeights: [number, number][] = [
    [0, 10], // alcuni deal senza activity
    [1, 10],
    [2, 15],
    [3, 30],
    [4, 30],
  ];

  type ActivityInput = {
    description: string;
    date: Date;
    dealId: number;
    userId: number;
    activityTypeId: number;
  };

  const activitiesToCreate: ActivityInput[] = [];

  for (let i = 0; i < newDeals.length; i++) {
    const deal = newDeals[i];
    const dealSeed = dealsToCreate[i];
    const count = weightedPick(activityCountWeights);

    // Le activity vanno distribuite tra dateCreation e dateLastModified
    // (o "oggi" se il deal è ancora aperto e dateLastModified è recente).
    const windowEnd = deal.dateLastModified > NOW ? NOW : deal.dateLastModified;
    const windowStart = deal.dateCreation;
    const windowMs = Math.max(windowEnd.getTime() - windowStart.getTime(), 1000 * 60 * 60);

    for (let a = 0; a < count; a++) {
      const type = typeOrder[randInt(0, typeOrder.length - 1)];
      const templates = templatesByType[type];
      const text = pick(templates);
      const offsetMs = randInt(0, Math.floor(windowMs));
      const date = new Date(windowStart.getTime() + offsetMs);

      activitiesToCreate.push({
        description: text,
        date,
        dealId: deal.dealId,
        userId: dealSeed.userId,
        activityTypeId: activityTypeByCode[type],
      });
    }
  }

  await prisma.activity.createMany({ data: activitiesToCreate });

  console.log("Seed completato:", {
    adminRole,
    sellerRole,
    users: dataUsers.length,
    dealStates: dealStates.length,
    activityTypes: activityTypes.length,
    companies: 15,
    contacts: allContacts.length,
    deals: dealsToCreate.length,
    activities: activitiesToCreate.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });