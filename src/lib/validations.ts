import { z } from "zod";

export const eventFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Název události musí mít alespoň 3 znaky" })
    .max(100, { message: "Název je příliš dlouhý" }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Identifikátor (slug) smí obsahovat jen malá písmena, číslice a pomlčky",
    })
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(500).optional(),
  date: z.string().optional(),
  location: z.string().trim().max(120).optional(),
  isActive: z.boolean().default(true),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

export const registrationFormSchema = z.object({
  eventId: z.string().optional(),
  firstName: z
    .string()
    .trim()
    .min(2, { message: "Jméno musí mít alespoň 2 znaky" })
    .max(50, { message: "Jméno je příliš dlouhé" }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "Příjmení musí mít alespoň 2 znaky" })
    .max(50, { message: "Příjmení je příliš dlouhé" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Zadejte platnou e-mailovou adresu" }),
  city: z
    .string()
    .trim()
    .min(2, { message: "Zadejte své bydliště nebo farnost (např. Prostějov)" })
    .max(80, { message: "Název je příliš dlouhý" }),
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

export const checkinQuerySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: "Kód nebo e-mail nesmí být prázdný" }),
  eventId: z.string().optional(),
});

export type CheckinQueryData = z.infer<typeof checkinQuerySchema>;

export const loginSchema = z.object({
  password: z.string().min(1, { message: "Zadejte heslo organizátora" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
