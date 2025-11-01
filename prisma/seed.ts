// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // <--- IMPORT MANQUANT À AJOUTER

const prisma = new PrismaClient();

// --- DÉFINITION DES DONNÉES ---

// 1. Définissons toutes les permissions granulaires de notre application
const permissionsData = [
  // Permissions pour le Dashboard
  { name: 'dashboard:read', description: 'Voir le dashboard' },

  // Permissions pour les Utilisateurs
  { name: 'users:create', description: 'Créer un utilisateur' },
  { name: 'users:read', description: 'Voir la liste des utilisateurs' },
  { name: 'users:read:own', description: 'Voir son propre profil' },
  { name: 'users:update', description: 'Modifier un utilisateur' },
  { name: 'users:update:own', description: 'Modifier son propre profil' },
  { name: 'users:delete', description: 'Supprimer un utilisateur' },

  // Permissions pour les Prospects
  { name: 'prospects:create', description: 'Créer un prospect' },
  { name: 'prospects:read', description: 'Voir la liste des prospects' },
  { name: 'prospects:read:own', description: 'Voir les prospects qui me sont assignés' },
  { name: 'prospects:update', description: 'Modifier un prospect' },
  { name: 'prospects:update:own', description: 'Modifier un prospect qui m\'est assigné' },
  { name: 'prospects:delete', description: 'Supprimer un prospect' },
  
  // Permissions pour les Formations
  { name: 'formations:create', description: 'Créer une formation' },
  { name: 'formations:read', description: 'Voir la liste des formations' },
  { name: 'formations:update', description: 'Modifier une formation' },
  { name: 'formations:delete', description: 'Supprimer une formation' },

  // Permissions pour les Simulateurs
  { name: 'simulateurs:create', description: 'Créer un simulateur' },
  { name: 'simulateurs:read', description: 'Voir la liste des simulateurs' },
  { name: 'simulateurs:update', description: 'Modifier un simulateur' },
  { name: 'simulateurs:delete', description: 'Supprimer un simulateur' },

  // Permissions pour les Interactions
  { name: 'interactions:create', description: 'Créer une interaction' },
  { name: 'interactions:read', description: 'Voir la liste des interactions' },
  { name: 'interactions:update', description: 'Modifier une interaction' },
  { name: 'interactions:delete', description: 'Supprimer une interaction' },

  // Permissions pour les Commentaires
  { name: 'comments:create', description: 'Créer un commentaire' },
  { name: 'comments:read', description: 'Voir la liste des commentaires' },
  { name: 'comments:update', description: 'Modifier un commentaire' },
  { name: 'comments:delete', description: 'Supprimer un commentaire' },

  // Permissions pour l'Administration (Rôles et Permissions)
  { name: 'roles:create', description: 'Créer un rôle' },
  { name: 'roles:read', description: 'Voir la liste des rôles' },
  { name: 'roles:update', description: 'Modifier un rôle' },
  { name: 'roles:delete', description: 'Supprimer un rôle' },
  { name: 'permissions:read', description: 'Voir la liste des permissions' },
];

// 2. Définissons les rôles de base
const rolesData = [
  { name: 'DIRECTEUR_GENERAL', description: 'Accès total à toutes les données et fonctionnalités.' },
  { name: 'COUNTRY_MANAGER', description: 'Gère les données pour son pays.' },
  { name: 'SALES_OFFICER', description: 'Gère les prospects qui lui sont assignés.' },
];

// 3. Définissons les utilisateurs de test
const testUsersData = [
  // 1 Directeur Général
  {
    email: 'dg.kouassi@cmrprospect.com',
    firstName: 'Jean',
    lastName: 'Kouassi',
    password: 'password123',
    country: 'Côte d\'Ivoire',
    roleName: 'DIRECTEUR_GENERAL',
  },
  // 2 Country Managers
  {
    email: 'cm.diop@cmrprospect.com',
    firstName: 'Awa',
    lastName: 'Diop',
    password: 'password123',
    country: 'Sénégal',
    roleName: 'COUNTRY_MANAGER',
  },
  {
    email: 'cm.yao@cmrprospect.com',
    firstName: 'Koffi',
    lastName: 'Yao',
    password: 'password123',
    country: 'Côte d\'Ivoire',
    roleName: 'COUNTRY_MANAGER',
  },
  // 4 Sales Officers (2 par pays)
  {
    email: 'so.fall@cmrprospect.com',
    firstName: 'Moussa',
    lastName: 'Fall',
    password: 'password123',
    country: 'Sénégal',
    roleName: 'SALES_OFFICER',
  },
  {
    email: 'so.sow@cmrprospect.com',
    firstName: 'Fatoumata',
    lastName: 'Sow',
    password: 'password123',
    country: 'Sénégal',
    roleName: 'SALES_OFFICER',
  },
  {
    email: 'so.kone@cmrprospect.com',
    firstName: 'Yasmine',
    lastName: 'Koné',
    password: 'password123',
    country: 'Côte d\'Ivoire',
    roleName: 'SALES_OFFICER',
  },
  {
    email: 'so.traore@cmrprospect.com',
    firstName: 'Bamba',
    lastName: 'Traoré',
    password: 'password123',
    country: 'Côte d\'Ivoire',
    roleName: 'SALES_OFFICER',
  },
];

// --- LOGIQUE DE PEUPLEMENT ---

async function main() {
  console.log('🌱 Début du peuplement de la base de données...');

  // Étape 1: Créer les permissions
  console.log('Création des permissions...');
  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log('✅ Permissions créées.');

  // Étape 2: Créer les rôles
  console.log('Création des rôles...');
  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log('✅ Rôles créés.');

  // Étape 3: Associer les permissions aux rôles
  console.log('Association des permissions aux rôles...');
  const dgRole = await prisma.role.findUnique({ where: { name: 'DIRECTEUR_GENERAL' } });
  const cmRole = await prisma.role.findUnique({ where: { name: 'COUNTRY_MANAGER' } });
  const soRole = await prisma.role.findUnique({ where: { name: 'SALES_OFFICER' } });
  const allPermissions = await prisma.permission.findMany();

  if (dgRole && cmRole && soRole && allPermissions.length > 0) {
    // Directeur Général : Toutes les permissions
    await prisma.role.update({
      where: { id: dgRole.id },
      data: { permissions: { connect: allPermissions.map(p => ({ id: p.id })) } },
    });
    console.log('✅ Permissions assignées au DIRECTEUR_GENERAL.');

    // Country Manager : Permissions de lecture, création, mise à jour (pas de suppression, pas d'admin)
    const cmPermissions = allPermissions.filter(p => 
      !p.name.includes('delete') && !p.name.includes(':own') && !p.name.startsWith('roles:') && !p.name.startsWith('permissions:')
    );
    await prisma.role.update({
      where: { id: cmRole.id },
      data: { permissions: { connect: cmPermissions.map(p => ({ id: p.id })) } },
    });
    console.log('✅ Permissions assignées au COUNTRY_MANAGER.');

    // Sales Officer : Uniquement permissions de lecture/mise à jour/création sur ses propres données
    const soPermissions = allPermissions.filter(p => 
      p.name.includes(':own') || p.name.includes('create') || p.name === 'dashboard:read'
    );
    await prisma.role.update({
      where: { id: soRole.id },
      data: { permissions: { connect: soPermissions.map(p => ({ id: p.id })) } },
    });
    console.log('✅ Permissions assignées au SALES_OFFICER.');
  }

  // Étape 4: Créer les utilisateurs de test// prisma/seed.ts (dans la fonction main)

  // ... (le code des étapes 1, 2, 3 reste identique)

  // Étape 4: Créer les utilisateurs de test
  console.log('👥 Création des utilisateurs de test...');
  
  // On vérifie que tous les rôles ont bien été trouvés avant de continuer
  if (!dgRole || !cmRole || !soRole) {
    console.error('❌ Impossible de créer les utilisateurs : un des rôles de base n\'a pas été trouvé.');
    return; // On arrête le seed si les rôles manquent
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const userData of testUsersData) {
    let roleId: string;

    // --- CORRECTION CRUCIALE ---
    // On utilise un switch pour mapper le nom du rôle à son ID de manière sûre
    switch (userData.roleName) {
      case 'DIRECTEUR_GENERAL':
        roleId = dgRole.id;
        break;
      case 'COUNTRY_MANAGER':
        roleId = cmRole.id;
        break;
      case 'SALES_OFFICER':
        roleId = soRole.id;
        break;
      default:
        // Si un nom de rôle n'est pas géré, on arrête tout avec une erreur claire
        throw new Error(`Nom de rôle inconnu dans les données de test : ${userData.roleName}`);
    }

    await prisma.user.upsert({
      where: { email: userData.email },
      update: {}, 
      create: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        country: userData.country,
        roleId: roleId, // On utilise la variable `roleId` sûre
        isActive: true,
      },
    });
  }
  console.log('✅ Utilisateurs de test créés avec succès.');

  console.log('🎉 Peuplement terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Une erreur est survenue lors du peuplement :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });