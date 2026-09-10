import { prisma } from "../src/lib/prisma";

async function main() {
  const adminRole = await prisma.role.create({
    data: { description: "Amministratore", level: 1 },
  });

  const sellerRole = await prisma.role.create({
    data: { description: "Venditore", level: 2 },
  });

  await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: "TEMP_PLAIN_TEXT", // sistemiamo con bcrypt al punto 6.3
      name: "Admin",
      surname: "System",
      birthDate: new Date("1990-01-01"),
      roleId: adminRole.roleId,
    },
  });

  const dealStates = await prisma.dealState.createMany({
    data: [
      { code: "NEW", slug: "nuovo", label: "Nuovo", sequence: 1 },
      { code: "PROPOSAL", slug: "proposta", label: "Proposta", sequence: 2 },
      { code: "WON", slug: "vinto", label: "Vinto", sequence: 3 },
      { code: "LOST", slug: "perso", label: "Perso", sequence: 4 },
    ],
  });

  const activityTypes = await prisma.activityType.createMany({
    data: [
      { code: "CALL", label: "Chiamata" },
      { code: "EMAIL", label: "Email" },
      { code: "MEETING", label: "Meeting" },
    ],
  });

  console.log("Seed completato:", { adminRole, sellerRole, dealStates, activityTypes });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });