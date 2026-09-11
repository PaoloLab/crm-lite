import { prisma } from "../src/lib/prisma";

async function main() {
  const adminRole = await prisma.role.create({
    data: { description: "Amministratore", level: 1 },
  });

  const sellerRole = await prisma.role.create({
    data: { description: "Venditore", level: 2 },
  });

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

  // Recupero gli id reali: createMany non restituisce i record creati
  const dealStates = await prisma.dealState.findMany();
  const activityTypes = await prisma.activityType.findMany();

  const dealStateBySlug = Object.fromEntries(
    dealStates.map((s) => [s.slug, s.dealStateId])
  );
  const activityTypeByCode = Object.fromEntries(
    activityTypes.map((t) => [t.code, t.activityTypeId])
  );

  // --- Companies (12) ---
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

  // --- Contacts (15) ---
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
  // Contatti senza azienda, per testare companyId nullable
  await prisma.contact.create({ data: { name: "Paolo", surname: "Villa", companyId: null } });
  await prisma.contact.create({ data: { name: "Valentina", surname: "De Luca", companyId: null } });

  // --- Deals (14, tutte su userId: 1) ---
  const dealOrdiniExport = await prisma.deal.create({
    data: { title: "Gestione ordini export", value: "18500.00", dealStateId: dealStateBySlug["proposta"], userId: adminUser.userId, contactId: contactCorte.contactId },
  });
  const dealPianoAnnuale = await prisma.deal.create({
    data: { title: "Piano annuale", value: "9200.00", dealStateId: dealStateBySlug["nuovo"], userId: adminUser.userId, contactId: contactVetra.contactId },
  });
  const dealPiattaformaCommerciale = await prisma.deal.create({
    data: { title: "Piattaforma commerciale", value: "27600.00", dealStateId: dealStateBySlug["proposta"], userId: adminUser.userId, contactId: contactMeridiana.contactId },
  });
  const dealRinnovoLicenze = await prisma.deal.create({
    data: { title: "Rinnovo licenze 2027", value: "22000.00", dealStateId: dealStateBySlug["proposta"], userId: adminUser.userId, contactId: contactNordika.contactId },
  });
  const dealSuiteCompleta = await prisma.deal.create({
    data: { title: "Suite completa", value: "15400.00", dealStateId: dealStateBySlug["vinto"], userId: adminUser.userId, contactId: contactLumen.contactId },
  });
  const dealTrackingFlotta = await prisma.deal.create({
    data: { title: "Tracking flotta", value: "11750.00", dealStateId: dealStateBySlug["nuovo"], userId: adminUser.userId, contactId: contactOrso.contactId },
  });
  const dealEspansioneShowroom = await prisma.deal.create({
    data: { title: "Espansione showroom", value: "6300.00", dealStateId: dealStateBySlug["perso"], userId: adminUser.userId, contactId: contactVetra.contactId },
  });
  const dealConsulenzaStrategica = await prisma.deal.create({
    data: { title: "Consulenza strategica Q4", value: "14200.00", dealStateId: dealStateBySlug["nuovo"], userId: adminUser.userId, contactId: contactAltair.contactId },
  });
  const dealComponentiMetallici = await prisma.deal.create({
    data: { title: "Fornitura componenti metallici", value: "32800.00", dealStateId: dealStateBySlug["proposta"], userId: adminUser.userId, contactId: contactFerro.contactId },
  });
  const dealProgettoSostenibilita = await prisma.deal.create({
    data: { title: "Progetto sostenibilità", value: "19500.00", dealStateId: dealStateBySlug["vinto"], userId: adminUser.userId, contactId: contactBosco.contactId },
  });
  const dealIntegrazioneErp = await prisma.deal.create({
    data: { title: "Integrazione ERP", value: "45000.00", dealStateId: dealStateBySlug["proposta"], userId: adminUser.userId, contactId: contactQuercia.contactId },
  });
  const dealRinnovoHotellerie = await prisma.deal.create({
    data: { title: "Rinnovo contratto hôtellerie", value: "27000.00", dealStateId: dealStateBySlug["nuovo"], userId: adminUser.userId, contactId: contactStella.contactId },
  });
  const dealMaterialiCantiere = await prisma.deal.create({
    data: { title: "Fornitura materiali cantiere", value: "12600.00", dealStateId: dealStateBySlug["perso"], userId: adminUser.userId, contactId: contactPonte.contactId },
  });
  const dealSecondoLotto = await prisma.deal.create({
    data: { title: "Secondo lotto licenze", value: "9800.00", dealStateId: dealStateBySlug["vinto"], userId: adminUser.userId, contactId: contactNordikaBis.contactId },
  });

  // --- Activities (generate molte, cicliche sui 3 tipi, tutte su userId: 1) ---
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

  type ActivityInput = {
    description: string;
    date: Date;
    dealId: number;
    userId: number;
    activityTypeId: number;
  };

  const activitiesToCreate: ActivityInput[] = [];
  let cursor = new Date("2026-09-11T18:00:00");
  let templateCursor = 0;

  function pushActivities(dealId: number, count: number) {
    for (let i = 0; i < count; i++) {
      const type = typeOrder[templateCursor % typeOrder.length];
      const templates = templatesByType[type];
      const text = templates[templateCursor % templates.length];
      cursor = new Date(cursor.getTime() - 1000 * 60 * 60 * 24 * (1 + (templateCursor % 3)));
      activitiesToCreate.push({
        description: text,
        date: new Date(cursor),
        dealId,
        userId: adminUser.userId,
        activityTypeId: activityTypeByCode[type],
      });
      templateCursor++;
    }
  }

  pushActivities(dealOrdiniExport.dealId, 4);
  pushActivities(dealPianoAnnuale.dealId, 1);
  pushActivities(dealPiattaformaCommerciale.dealId, 3);
  pushActivities(dealRinnovoLicenze.dealId, 5);
  pushActivities(dealSuiteCompleta.dealId, 4);
  pushActivities(dealTrackingFlotta.dealId, 2);
  pushActivities(dealEspansioneShowroom.dealId, 2);
  pushActivities(dealConsulenzaStrategica.dealId, 1);
  pushActivities(dealComponentiMetallici.dealId, 4);
  pushActivities(dealProgettoSostenibilita.dealId, 5);
  pushActivities(dealIntegrazioneErp.dealId, 3);
  pushActivities(dealRinnovoHotellerie.dealId, 2);
  pushActivities(dealMaterialiCantiere.dealId, 3);
  pushActivities(dealSecondoLotto.dealId, 4);

  await prisma.activity.createMany({ data: activitiesToCreate });

  console.log("Seed completato:", {
    adminRole,
    sellerRole,
    adminUser,
    dealStates: dealStates.length,
    activityTypes: activityTypes.length,
    companies: 12,
    contacts: 15,
    deals: 14,
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