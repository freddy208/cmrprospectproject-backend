/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";

@Injectable()
export class AuthorizationService {
  canAccessResource(user: User, resource: any, action: 'create'|'read'|'update'|'delete'): boolean {
    // DG voit tout
    if (user.role === 'DIRECTEUR_GENERAL') return true;

    // Country Manager : accès limité au pays
    if (user.role === 'COUNTRY_MANAGER') {
      if (resource.country && resource.country !== user.country) return false;
      if (resource.createdBy && resource.createdBy.country && resource.createdBy.country !== user.country) return false;
      return true;
    }

    // Sales Officer : accès limité aux ressources qui lui sont assignées
    if (user.role === 'SALES_OFFICER') {
      if (resource.assignedToId !== user.id && resource.createdById !== user.id) return false;
      return true;
    }

    return false;
  }

    // Pour Prisma : retourner le scope pays
    countryScope(user: User): string | null {
      return user.role === 'DIRECTEUR_GENERAL' ? null : user.country;
    }
    canCreateFormation(user) {
    return user.role === 'DIRECTOR' || user.role === 'COUNTRY_MANAGER';
  }

  canAccessFormation(user, formation) {
    return user.role === 'DIRECTOR' || formation.country === user.country;
  }

  canUpdateFormation(user, formation) {
    return user.role === 'DIRECTOR' || (user.role === 'COUNTRY_MANAGER' && formation.country === user.country);
  }

  canDeleteFormation(user, formation) {
    return this.canUpdateFormation(user, formation);
  }
  isCountryManager(user: User): boolean {
    return user.role === 'COUNTRY_MANAGER';
  }
  canCreateSimulateur(user) {
  return user.role === 'DIRECTOR' || user.role === 'COUNTRY_MANAGER';
}

canAccessSimulateur(user, simulateur) {
  return user.role === 'DIRECTOR' || simulateur.country === user.country;
}

canUpdateSimulateur(user, simulateur) {
  return (
    user.role === 'DIRECTOR' ||
    (user.role === 'COUNTRY_MANAGER' && simulateur.country === user.country)
  );
}

canDeleteSimulateur(user, simulateur) {
  return this.canUpdateSimulateur(user, simulateur);
}


}
