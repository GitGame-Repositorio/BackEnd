import { z } from "zod";

export const emailScheme = z
  .string()
  .min(1, "É necessário repassar um email")
  .email({ message: "Email invalido" });

export const passwordScheme = z
  .string()
  .min(1, "É necessário passar a senha")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])/,
    "Necessário que contenha letras maiúsculas e minusculas"
  )
  .regex(/^(?=.*\d)/, "Necessário conter números")
  .regex(/^(?=.*[!@#$%^&*])/, "Necessário conter caracteres especiais")
  .regex(/.{8,}$/, "Necessário que a senha contenha mais de 8 caracteres");
