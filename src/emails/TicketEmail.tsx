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
  tableNumber?: number | null;
  seatNumber?: number | null;
  qrCodeSrc?: string;
  qrCodeDataUrl?: string;
  ticketUrl: string;
}

export function TicketEmail({
  eventName = "Církevní Silvestr 2026 – Malý princ",
  firstName = "Jan",
  lastName = "Novák",
  email = "jan.novak@example.cz",
  city = "Prostějov",
  registrationId = "c796b34a-95ee-46a4-97c3-30528e188f57",
  tableNumber,
  seatNumber,
  qrCodeSrc,
  qrCodeDataUrl = "",
  ticketUrl = "http://localhost:3000/registrace/uspech?id=test",
}: TicketEmailProps) {
  // Gmail completely blocks "data:image/..." URIs.
  // Using cid:ticket-qr-code pairs with the Resend attachment contentId for 100% reliable rendering in Gmail.
  const resolvedQrSrc =
    qrCodeSrc ||
    (qrCodeDataUrl && !qrCodeDataUrl.startsWith("data:")
      ? qrCodeDataUrl
      : "cid:ticket-qr-code");

  return (
    <Html lang="cs">
      <Head />
      <Preview>
        {`Tvá vstupenka na ${eventName} v Brodku u Prostějova (QR kód uvnitř)`}
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
              tvá registrace na <strong>{eventName}</strong> v Brodku u
              Prostějova byla úspěšně přijata! Vstupné je{" "}
              <strong>dobrovolné</strong> a díky této registraci se vyhneš
              čekání ve frontě u vstupu.
            </Text>

            {/* QR Card */}
            <Section style={qrCard}>
              <Text style={qrCardTitle}>TVŮJ OSOBNÍ QR KÓD PRO VSTUP</Text>

              {/* QR Image rendering */}
              <Img
                src={resolvedQrSrc}
                width="220"
                height="220"
                alt="QR kód pro vstup"
                style={qrImage}
              />

              <Text style={qrInstruction}>
                Ukaž tento kód na displeji telefonu při vstupu do hasičárny.
              </Text>

              <Text style={qrNotice}>
                Pokud se obrázek výše nezobrazuje,{" "}
                <Link href={ticketUrl} style={qrNoticeLink}>
                  otevři si svou vstupenku v prohlížeči
                </Link>
                .
              </Text>
            </Section>

            {/* Registration Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Údaje o vstupence:</Text>
              <Text style={detailRow}>
                <strong>Jméno:</strong> {firstName} {lastName}
              </Text>
              <Text style={detailRow}>
                <strong>E-mail:</strong> {email}
              </Text>
              <Text style={detailRow}>
                <strong>Bydliště / Farnost:</strong> {city}
              </Text>
              <Text style={detailRow}>
                <strong>Kdy:</strong> Sobota 28. listopadu 2026 (od 18:00)
              </Text>
              <Text style={detailRow}>
                <strong>Kde:</strong> Brodek u Prostějova (kostel & hasičárna)
              </Text>
              <Text style={detailRow}>
                <strong>Místo u stolu:</strong>{" "}
                {tableNumber && seatNumber ? (
                  <span style={{ color: "#d4af37", fontWeight: "bold" }}>
                    Stůl {tableNumber} • Místo {seatNumber}
                  </span>
                ) : (
                  <span>Bez rezervace stolu (volné stání / tanec)</span>
                )}
              </Text>
              <Text style={detailRow}>
                <strong>Kód registrace:</strong>{" "}
                <span style={codeText}>{registrationId.slice(0, 8)}...</span>
              </Text>
            </Section>

            {/* Direct Ticket Link Button */}
            <Section style={buttonContainer}>
              <Link href={ticketUrl} style={button}>
                Zobrazit a stáhnout vstupenku
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Practical Info */}
            <Section style={infoSection}>
              <Text style={infoHeading}>Důležité informace na cestu:</Text>
              <Text style={bulletPoint}>
                ⛪ <strong>Harmonogram:</strong> 18:00 mše svatá v kostele, od
                19:30 ples v hasičárně.
              </Text>
              <Text style={bulletPoint}>
                👞 <strong>Přezůvky & dress code:</strong> Doporučujeme plesové
                oblečení a čisté přezůvky do sálu.
              </Text>
              <Text style={bulletPoint}>
                🎁 <strong>Tombola:</strong> Chcete-li přispět darem do tomboly,
                napište nám na Instagram @mladezprostejov.
              </Text>
              <Text style={bulletPoint}>
                🎂 <strong>Společný stůl:</strong> Můžeš přinést slané či sladké
                dobroty na společný raut.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footerNote}>
              Tento e-mail ti byl zaslán na základě tvé online registrace.
              <br />
              Pořádá <strong>Mládež děkanátu Prostějov</strong> &{" "}
              <strong>Sarkander z. s.</strong>
              <br />V případě dotazů nám napiš na{" "}
              <Link
                href="https://instagram.com/mladezprostejov"
                style={footerLink}
              >
                Instagram @mladezprostejov
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f5f3ef",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  padding: "30px 10px",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "560px",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid rgba(182, 130, 53, 0.3)",
  boxShadow: "0 6px 20px rgba(29, 27, 26, 0.08)",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#1d1b1a",
  padding: "34px 24px 30px",
  textAlign: "center" as const,
  color: "#f8f4f4",
  borderBottom: "2px solid #b68235",
};

const tagline: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "2.5px",
  textTransform: "uppercase" as const,
  fontWeight: "600",
  color: "#e1ad66",
  margin: "0 0 6px 0",
};

const heading: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 8px 0",
  color: "#f8f4f4",
};

const subtitle: React.CSSProperties = {
  fontSize: "14px",
  color: "#d7d3d3",
  margin: "0",
};

const contentSection: React.CSSProperties = {
  padding: "28px 24px",
};

const greetingText: React.CSSProperties = {
  fontSize: "18px",
  color: "#201f1d",
  marginBottom: "12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#444141",
  margin: "0 0 20px 0",
};

const qrCard: React.CSSProperties = {
  backgroundColor: "#faf8f5",
  border: "1px solid #b68235",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "24px 0",
};

const qrCardTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "bold",
  color: "#7d5411",
  letterSpacing: "1.5px",
  margin: "0 0 12px 0",
  textTransform: "uppercase" as const,
};

const qrImage: React.CSSProperties = {
  margin: "0 auto",
  display: "block",
  borderRadius: "8px",
  border: "1px solid rgba(182, 130, 53, 0.3)",
  backgroundColor: "#ffffff",
  padding: "8px",
};

const qrInstruction: React.CSSProperties = {
  fontSize: "13px",
  color: "#7d5411",
  margin: "12px 0 0 0",
  fontWeight: "600",
};

const qrNotice: React.CSSProperties = {
  fontSize: "12px",
  color: "#7d7979",
  margin: "10px 0 0 0",
};

const qrNoticeLink: React.CSSProperties = {
  color: "#b68235",
  fontWeight: "bold",
  textDecoration: "underline",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f8f7f5",
  border: "1px solid rgba(182, 130, 53, 0.2)",
  borderRadius: "10px",
  padding: "16px",
  margin: "20px 0",
};

const detailsTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#201f1d",
  margin: "0 0 10px 0",
};

const detailRow: React.CSSProperties = {
  fontSize: "14px",
  color: "#444141",
  margin: "4px 0",
};

const codeText: React.CSSProperties = {
  fontFamily: "monospace",
  backgroundColor: "#eae7e7",
  padding: "2px 6px",
  borderRadius: "4px",
  fontSize: "12px",
  color: "#201f1d",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "24px 0 16px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#b68235",
  color: "#1d1b1a",
  padding: "12px 26px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};

const hr: React.CSSProperties = {
  borderColor: "rgba(182, 130, 53, 0.2)",
  margin: "24px 0",
};

const infoSection: React.CSSProperties = {
  margin: "16px 0",
};

const infoHeading: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#201f1d",
  margin: "0 0 12px 0",
};

const bulletPoint: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#444141",
  margin: "6px 0",
};

const footerNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#7d7979",
  textAlign: "center" as const,
  lineHeight: "1.6",
  margin: "0",
};

const footerLink: React.CSSProperties = {
  color: "#b68235",
  textDecoration: "underline",
};
