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
  tableCount: z.number().int().min(1).max(50).optional(),
  seatsPerTable: z.number().int().min(1).max(20).optional(),
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
  birthDate: z
    .string()
    .trim()
    .min(1, { message: "Zadejte přesné datum narození" })
    .refine(
      (val) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const d = new Date(val);
          return !Number.isNaN(d.getTime()) && d < new Date();
        }
        if (/^\d{1,2}\.\s*\d{1,2}\.\s*\d{4}$/.test(val)) {
          return true;
        }
        const d = new Date(val);
        return !Number.isNaN(d.getTime()) && d < new Date();
      },
      { message: "Zadejte platné datum narození" },
    ),
  address: z
    .string()
    .trim()
    .min(5, {
      message:
        "Zadejte přesnou adresu (např. Dolní 15, Prostějov nebo Brodek 42)",
    })
    .max(150, { message: "Adresa je příliš dlouhá" }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Zadejte platnou e-mailovou adresu" }),
  city: z
    .string()
    .trim()
    .min(2, {
      message: "Zadejte svou farnost nebo obec (např. Brodek, Prostějov)",
    })
    .max(80, { message: "Název je příliš dlouhý" }),
  tableNumber: z.number().int().positive().nullable().optional(),
  seatNumber: z.number().int().positive().nullable().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message:
      "Pro odeslání registrace je nutný souhlas se zpracováním osobních údajů",
  }),
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
