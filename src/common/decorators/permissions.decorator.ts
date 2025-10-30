/* eslint-disable prettier/prettier */
// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Clé utilisée pour stocker les métadonnées de permissions.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Décorateur pour définir les permissions requises pour un endpoint.
 * @param permissions Une ou plusieurs chaînes de caractères représentant les permissions (ex: 'prospects:read').
 */
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);