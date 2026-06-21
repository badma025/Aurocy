import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ReceiptEmailProps {
  customerName: string;
  deckName: string;
  downloadUrl: string;
}

export const ReceiptEmail = ({
  customerName = "Student",
  deckName = "AQA A-Level Physics",
  downloadUrl = "https://aurocy.com",
}: ReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your flashcards are ready to download!</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-[40px] max-w-[600px] rounded-lg border border-gray-200 bg-white p-[40px] shadow-sm">
            {/* Logo / Header Area */}
            <Section className="mb-[32px] text-center">
              <Heading className="m-0 text-3xl font-bold text-[#0B1120]">
                Aurocy
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Hi {customerName},
              </Text>
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Thank you for your purchase. Your <strong>{deckName}</strong> flashcard deck is ready to supercharge your revision. 
              </Text>
              <Text className="text-[16px] leading-[24px] text-gray-700">
                Click the button below to download your .apkg file securely. You can import this directly into Anki.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="mb-[32px] text-center">
              <Button
                className="rounded-md bg-[#0B1120] px-6 py-3 text-center text-[16px] font-semibold text-white no-underline transition-colors hover:bg-gray-800"
                href={downloadUrl}
              >
                Download Flashcards
              </Button>
            </Section>

            {/* Footer */}
            <Section className="mt-[48px] border-t border-gray-200 pt-[24px]">
              <Text className="text-[14px] leading-[24px] text-gray-500">
                Having trouble importing your deck? Reply directly to this email and we'll help you get sorted.
              </Text>
              <Text className="text-[12px] leading-[24px] text-gray-400">
                © {new Date().getFullYear()} Aurocy. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReceiptEmail;