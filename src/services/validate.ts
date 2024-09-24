import { emailScheme, passwordScheme } from "./scheme";
import { msgIsMissing } from "./objError";

export const validateEmail = (email: string) => {
  const result = emailScheme.safeParse(email);
  const objMessage = {
    Required: msgIsMissing("email"),
  };
  if (!result.success) {
    const message = result?.error?.errors
      .map((item) => objMessage[item.message])
      .join(" | ");
    throw new Error(message || "Invalid email format");
  }
};

export const validatePassword = (password: string) => {
  const result = passwordScheme.safeParse(password);
  const objMessage = {
    Required: msgIsMissing("password"),
  };
  if (!result.success) {
    const message = result?.error?.errors
      .map((item) => objMessage[item.message])
      .join(" | ");
    throw new Error(message || "Invalid Password");
  }
};
