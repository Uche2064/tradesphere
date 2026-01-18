import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ChangedPasswordEmailProps {
  fullName: string;
  email: string;
  changedAt?: string;
  ipAddress?: string;
}

export default function ChangedPasswordEmail({
  fullName,
  email,
  changedAt,
  ipAddress,
}: ChangedPasswordEmailProps) {
  const formattedDate =
    changedAt ||
    new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Html>
      <Head lang="fr" />
      <Preview>TradeSphere - Confirmation de changement de mot de passe</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Mot de passe mis à jour</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Bonjour <strong>{fullName}</strong>,
            </Text>

            <Text style={paragraph}>
              Le mot de passe de votre compte TradeSphere ({email}) vient
              d&apos;être modifié.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Compte :</Text>
              <Text style={infoValue}>{email}</Text>

              <Text style={infoLabel}>Date et heure :</Text>
              <Text style={infoValue}>{formattedDate}</Text>

              {ipAddress && (
                <>
                  <Text style={infoLabel}>Adresse IP :</Text>
                  <Text style={infoValue}>{ipAddress}</Text>
                </>
              )}
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                Ce changement vient-il de vous ? Si vous ne reconnaissez pas
                cette action, réinitialisez immédiatement votre mot de passe et
                contactez notre support.
              </Text>
            </Section>

            <Text style={paragraph}>
              Si tout est en ordre, aucune action supplémentaire n&apos;est
              nécessaire.
            </Text>

            <Text style={footer}>
              Cordialement,
              <br />
              L&apos;équipe TradeSphere
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#0ea5e9",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const content = {
  padding: "0 48px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#525252",
};

const infoBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "2px solid #0ea5e9",
};

const infoLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "12px 0 4px 0",
  fontWeight: "600",
};

const infoValue = {
  fontSize: "16px",
  color: "#1f2937",
  fontWeight: "500",
  margin: "0 0 8px 0",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  fontSize: "14px",
  color: "#92400e",
  margin: "0",
  lineHeight: "22px",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "32px",
};
