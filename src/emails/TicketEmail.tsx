import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

interface TicketEmailProps {
  eventName?: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  registrationId: string;
  qrCodeDataUrl: string;
  ticketUrl: string;
}

export function TicketEmail({
  eventName = "Církevní Silvestr",
  firstName = "Jan",
  lastName = "Novák",
  email = "jan.novak@example.cz",
  city = "Prostějov",
  registrationId = "c796b34a-95ee-46a4-97c3-30528e188f57",
  qrCodeDataUrl = "",
  ticketUrl = "http://localhost:3000/registrace/uspech?id=test",
}: TicketEmailProps) {
  return (
    <Html lang="cs">
      <Head />
      <Preview>
        {`Tvá vstupenka na ${eventName} v Prostějově (QR kód uvnitř)`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={tagline}>Mládež děkanátu Prostějov</Text>
            <Heading style={heading}>{eventName}</Heading>
            <Text style={subtitle}>Vstupenka a rychlé odbavení u vstupu</Text>
          </Section>

          {/* Hero Greeting */}
          <Section style={contentSection}>
            <Text style={greetingText}>
              Ahoj <strong>{firstName}</strong>,
            </Text>
            <Text style={paragraph}>
              tvá registrace na <strong>{eventName}</strong> byla úspěšně
              přijata! Akce je zcela <strong>ZDARMA</strong> a díky této
              registraci se vyhneš čekání ve frontě u vstupu.
            </Text>

            {/* QR Card */}
            <Section style={qrCard}>
              <Text style={qrCardTitle}>TVŮJ OSOBNÍ QR KÓD PRO VSTUP</Text>
              {qrCodeDataUrl ? (
                <Img
                  src={qrCodeDataUrl}
                  alt="QR kód pro vstup"
                  width="220"
                  height="220"
                  style={qrImage}
                />
              ) : (
                <Text style={codeFallbackText}>{registrationId}</Text>
              )}
              <Text style={qrInstruction}>
                U vstupu stačí tento QR kód ukázat na displeji mobilu nebo
                vytištěný.
              </Text>
            </Section>

            {/* Registration Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Přehled registrace:</Text>
              <Text style={detailRow}>
                <strong>Účastník:</strong> {firstName} {lastName}
              </Text>
              <Text style={detailRow}>
                <strong>E-mail:</strong> {email}
              </Text>
              <Text style={detailRow}>
                <strong>Bydliště / farnost:</strong> {city}
              </Text>
              <Text style={detailRow}>
                <strong>Kód registrace:</strong>{" "}
                <span style={codeText}>{registrationId}</span>
              </Text>
            </Section>

            {/* Online Ticket Link */}
            <Section style={buttonContainer}>
              <Link href={ticketUrl} style={button}>
                Otevřít vstupenku v prohlížeči
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Info for participants */}
            <Section style={infoSection}>
              <Heading as="h3" style={infoHeading}>
                Co tě čeká a co s sebou?
              </Heading>
              <Text style={bulletPoint}>
                • <strong>Program:</strong> Společenství mladých z celého
                děkanátu, hry, kvízy, chvály, společná půlnoční adorace,
                přípitek a oslava.
              </Text>
              <Text style={bulletPoint}>
                • <strong>S sebou:</strong> Přezůvky, dobrou náladu a pokud
                můžeš, drobné slané či sladké občerstvení do společného stolu.
              </Text>
              <Text style={bulletPoint}>
                • <strong>Vstupné:</strong> Zcela zdarma.
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footerNote}>
              Těšíme se na tebe! <br />
              <strong>Tým animátorů mládeže děkanátu Prostějov</strong>
              <br />
              <Link href="https://mladez.dpv.cz" style={footerLink}>
                mladez.dpv.cz
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default TicketEmail;

// Inline CSS Styles for robust email client rendering
const main: React.CSSProperties = {
  backgroundColor: "#fdf8f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  padding: "24px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "560px",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid #fed7aa",
  boxShadow: "0 4px 12px rgba(234, 88, 12, 0.08)",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#ea580c",
  padding: "32px 24px 28px",
  textAlign: "center" as const,
  color: "#ffffff",
};

const tagline: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
  color: "#ffedd5",
  margin: "0 0 6px 0",
};

const heading: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "800",
  lineHeight: "1.2",
  margin: "0 0 8px 0",
  color: "#ffffff",
};

const subtitle: React.CSSProperties = {
  fontSize: "14px",
  color: "#ffedd5",
  margin: "0",
};

const contentSection: React.CSSProperties = {
  padding: "28px 24px",
};

const greetingText: React.CSSProperties = {
  fontSize: "18px",
  color: "#1e293b",
  marginBottom: "12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#334155",
  margin: "0 0 20px 0",
};

const qrCard: React.CSSProperties = {
  backgroundColor: "#fff7ed",
  border: "2px dashed #f97316",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const qrCardTitle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#c2410c",
  letterSpacing: "1px",
  margin: "0 0 12px 0",
};

const qrImage: React.CSSProperties = {
  margin: "0 auto",
  display: "block",
  borderRadius: "8px",
  border: "1px solid #fed7aa",
  backgroundColor: "#ffffff",
  padding: "8px",
};

const codeFallbackText: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  fontFamily: "monospace",
  color: "#0f172a",
};

const qrInstruction: React.CSSProperties = {
  fontSize: "13px",
  color: "#7c2d12",
  margin: "12px 0 0 0",
  fontWeight: "500",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "16px",
  margin: "20px 0",
};

const detailsTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#0f172a",
  margin: "0 0 10px 0",
};

const detailRow: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  margin: "4px 0",
};

const codeText: React.CSSProperties = {
  fontFamily: "monospace",
  backgroundColor: "#e2e8f0",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "12px",
  color: "#0f172a",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "24px 0 16px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#ea580c",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "9999px",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};

const hr: React.CSSProperties = {
  borderColor: "#fed7aa",
  margin: "24px 0",
};

const infoSection: React.CSSProperties = {
  margin: "16px 0",
};

const infoHeading: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1e293b",
  margin: "0 0 12px 0",
};

const bulletPoint: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#475569",
  margin: "6px 0",
};

const footerNote: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  textAlign: "center" as const,
  lineHeight: "1.6",
  margin: "0",
};

const footerLink: React.CSSProperties = {
  color: "#ea580c",
  textDecoration: "underline",
};
