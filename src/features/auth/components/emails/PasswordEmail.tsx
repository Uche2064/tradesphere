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

interface PasswordEmailProps {
  fullName: string;
  email: string;
  password: string;
}

export default function PasswordEmail({
  fullName,
  email,
  password,
}: PasswordEmailProps) {
  return (
    <Html>
      <Head lang="fr" />
      <Preview>TradeSphere - Vos identifiants de connexion</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Bienvenue sur TradeSphere</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Bonjour <strong>{fullName}</strong>,
            </Text>

            <Text style={paragraph}>
              Voici vos identifiants de connexion pour accéder à la plateforme TradeSphere :
            </Text>

            <Section style={credentialsBox}>
              <Text style={credentialLabel}>Email :</Text>
              <Text style={credentialValue}>{email}</Text>

              <Text style={credentialLabel}>Mot de passe temporaire :</Text>
              <Text style={credentialValue}>{password}</Text>
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>Important :</strong> Pour des raisons de sécurité, vous devrez
                obligatoirement changer ce mot de passe lors de votre première connexion.
              </Text>
            </Section>

            <Text style={paragraph}>
              Pour vous connecter, rendez-vous sur :{" "}
              <a href="https://tradesphere.com/auth/login" style={link}>
                https://tradesphere.com/auth/login
              </a>
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

const credentialsBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "2px solid #4F46E5",
};

const credentialLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "8px 0 4px 0",
  fontWeight: "600",
};

const credentialValue = {
  fontSize: "18px",
  color: "#1f2937",
  fontWeight: "bold",
  fontFamily: "monospace",
  margin: "0 0 16px 0",
  padding: "8px 12px",
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  border: "1px solid #e5e7eb",
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
};

const link = {
  color: "#4F46E5",
  textDecoration: "underline",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "32px",
};
