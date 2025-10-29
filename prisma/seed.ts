import { PrismaClient, UserRole, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Mot de passe par défaut pour tous les utilisateurs
  const defaultPassword = 'Password123!';

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const users = [
    {
      email: 'directeur.general@example.com',
      firstName: 'Jean',
      lastName: 'Kouassi',
      role: UserRole.DIRECTEUR_GENERAL,
      country: 'Côte d\'Ivoire',
      password: hashedPassword,
      status: Status.ACTIVE,
      isActive: true,
    },
    {
      email: 'country.manager.nigeria@example.com',
      firstName: 'Chinedu',
      lastName: 'Okafor',
      role: UserRole.COUNTRY_MANAGER,
      country: 'Nigeria',
      password: hashedPassword,
      status: Status.ACTIVE,
      isActive: true,
    },
    {
      email: 'country.manager.cameroun@example.com',
      firstName: 'Kwame',
      lastName: 'Mensah',
      role: UserRole.COUNTRY_MANAGER,
      country: 'Cameroun',
      password: hashedPassword,
      status: Status.ACTIVE,
      isActive: true,
    },
    {
      email: 'sales.officer.cameroun@example.com',
      firstName: 'Amina',
      lastName: 'Mwangi',
      role: UserRole.SALES_OFFICER,
      country: 'Cameroun',
      password: hashedPassword,
      status: Status.ACTIVE,
      isActive: true,
    },
    {
      email: 'sales.officer.nigeria@example.com',
      firstName: 'Oumar',
      lastName: 'Diopoku',
      role: UserRole.SALES_OFFICER,
      country: 'Nigeria',
      password: hashedPassword,
      status: Status.ACTIVE,
      isActive: true,
    },
    {
      email: 'sales.officer.cameroon@example.com',
      firstName: 'Chantal',
      lastName: 'Nkam',
      role: UserRole.SALES_OFFICER,
      country: 'Cameroun',
      password: hashedPassword,
      status: Status.ACTIVE,
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('✅ 6 utilisateurs seedés avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
