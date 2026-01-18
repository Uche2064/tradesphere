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

interface OTPEmailProps {
  fullName: string;
  otpCode: string;
  expiresAt: string; // en minutes
}

export default function OtpEmailTemplate({
  fullName,
  otpCode,
  expiresAt,
}: OTPEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre code de vérification TradeSphere</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Code de vérification</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Bonjour <strong>{fullName}</strong>,
            </Text>

            <Text style={paragraph}>
              Voici votre code de vérification pour accéder à votre compte TradeSphere :
            </Text>

            <Section style={otpBox}>
              <Text style={otpCodeStyle}>{otpCode}</Text>
            </Section>

            <Text style={paragraph}>
              Ce code expire le <strong>{expiresAt}</strong>.
            </Text>

            <Text style={warningText}>
              ⚠️ Ne partagez jamais ce code avec qui que ce soit.
            </Text>

            <Text style={footer}>
              Si vous n&apos;avez pas demandé ce code, veuillez ignorer cet email.
              <br />
              <br />
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
  backgroundColor: "#06b6d4",
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

const otpBox = {
  backgroundColor: "#f0fdfa",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
  border: "2px solid #06b6d4",
  textAlign: "center" as const,
};

const otpCodeStyle = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#0e7490",
  letterSpacing: "8px",
  margin: "0",
  fontFamily: "monospace",
};

const warningText = {
  fontSize: "14px",
  color: "#7f1d1d",
  backgroundColor: "#fee2e2",
  padding: "12px",
  borderRadius: "4px",
  margin: "24px 0",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  marginTop: "32px",
};
