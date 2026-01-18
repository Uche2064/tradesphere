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

interface LoginNotificationEmailProps {
  fullName: string;
  loginDate: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function LoginEmail({
  fullName,
  loginDate,
  loginTime,
  ipAddress,
  userAgent,
}: LoginNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle connexion détectée sur votre compte TradeSphere</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Nouvelle connexion détectée</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Bonjour <strong>{fullName}</strong>,
            </Text>

            <Text style={paragraph}>
              Nous vous informons qu&apos;une nouvelle connexion a été effectuée
              sur votre compte TradeSphere.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Date :</Text>
              <Text style={infoValue}>{loginDate}</Text>

              <Text style={infoLabel}>Heure :</Text>
              <Text style={infoValue}>{loginTime}</Text>

              {ipAddress && (
                <>
                  <Text style={infoLabel}>Adresse IP :</Text>
                  <Text style={infoValue}>{ipAddress}</Text>
                </>
              )}

              {userAgent && (
                <>
                  <Text style={infoLabel}>Navigateur :</Text>
                  <Text style={infoValue}>{userAgent}</Text>
                </>
              )}
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>⚠️ Ce n&apos;était pas vous ?</strong>
                <br />
                <br />
                Si vous n&apos;êtes pas à l&apos;origine de cette connexion,
                veuillez immédiatement :
                <br />
                • Changer votre mot de passe
                <br />
                • Activer l&apos;authentification à deux facteurs (2FA)
                <br />• Contacter notre support
              </Text>
            </Section>

            <Text style={paragraph}>
              Si c&apos;était bien vous, vous pouvez ignorer cet email en toute sécurité.
            </Text>

            <Text style={footer}>
              Cordialement,
              <br />
              L&apos;équipe TradeSphere
              <br />
              <br />
              <em style={{ fontSize: "12px", color: "#9ca3af" }}>
                Cet email est envoyé automatiquement pour assurer la sécurité de votre compte.
              </em>
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
  backgroundColor: "#4F46E5",
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
  border: "2px solid #4F46E5",
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
  backgroundColor: "#fee2e2",
  borderLeft: "4px solid #ef4444",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const warningText = {
  fontSize: "14px",
  color: "#7f1d1d",
  margin: "0",
  lineHeight: "22px",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "32px",
};
