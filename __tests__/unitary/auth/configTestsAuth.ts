import { regexEmail, regexUUID } from "../config";

export const expectUser: any = {
  id: expect.stringMatching(regexUUID),
  picture: "/images/common.png",
  email: "test@example.com",
  language: "portuguese",
  appearance: "LIGHT",
  name: "Test User",
  type: "logged",
  admin: undefined,
};

export const expectUserObj: any = {
  id: expect.stringMatching(regexUUID),
  picture: expect.any(String),
  email: expect.stringMatching(regexEmail),
  language: expect.any(String),
  name: expect.any(String),
  appearance: "LIGHT" || "DARK",
  type: "logged",
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
