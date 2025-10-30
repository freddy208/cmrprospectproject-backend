// src/user/types.ts
import { User, Role } from '@prisma/client';

/**
 * Type représentant un utilisateur dont la relation `role` a été chargée.
 * Utile pour les guards et services où l'utilisateur est toujours récupéré avec son rôle.
 */
export type UserWithRole = User & {
  role: Role; // On force la propriété `role` à être présente et non-undefined
};
