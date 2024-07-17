import { regexUUID } from "../config";

export const expectUser: any = {
  id: expect.stringMatching(regexUUID),
  picture: "/images/common.png",
  email: "test@example.com",
  language: "portuguese",
  apparence: "LIGHT",
  name: "Test User",
  admin: undefined,
};

export const expectAdminObj = {
  id_admin: expect.stringMatching(regexUUID),
  canCreateAdmin: false,
  canDeleteAdmin: false,
  canViewAllAdmin: false,
  canEditPrivilegiesAdmin: false,
  canManageCRUDPlayer: false,
  canManageCRUDReports: true,
  canManageContentGame: true,
  canReorderContentGame: true,
};
