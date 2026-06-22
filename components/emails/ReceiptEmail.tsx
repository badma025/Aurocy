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
      <Tailwind>
        <Head />
        <Preview>Your flashcards are ready to download!</Preview>
        <Body className="bg-[#0B1120] py-12 font-sans text-gray-200">
          <Container className="mx-auto max-w-[560px] rounded-xl border border-gray-800 bg-[#161F30] p-8 shadow-xl">
            
            {/* Header/Brand logo */}
            <Section className="mb-8 text-center border-b border-gray-800 pb-6">
              <Heading className="m-0 text-2xl font-extrabold tracking-tight text-white">
                Aurocy
              </Heading>
            </Section>

            {/* Content Greeting */}
            <Section className="mb-6">
              <Text className="text-[16px] leading-[24px] text-gray-300 font-medium">
                Hi {customerName},
              </Text>
              <Text className="text-[15px] leading-[24px] text-gray-400 mt-2">
                Thank you for supporting Aurocy! Your flashcard deck is fully compiled and ready to lock down your active recall.
              </Text>
            </Section>

            {/* Product Card Highlight */}
            <Section className="mb-8 rounded-lg bg-[#0B1120]/50 p-5 border border-gray-800/60">
              <Text className="m-0 text-[13px] uppercase tracking-wider text-gray-500 font-bold">
                Item Purchased
              </Text>
              <Text className="m-0 mt-1 text-[16px] font-semibold text-white">
                {deckName} Flashcards
              </Text>
              <Text className="m-0 mt-2 text-[14px] text-gray-400 leading-[20px]">
                Contains a complete `.apkg` collection optimized heavily for spaced repetition.
              </Text>
            </Section>

            {/* Action Area */}
            <Section className="mb-8 text-center">
              <Button
                className="inline-block rounded-lg bg-emerald-500 px-6 py-3.5 text-center text-[15px] font-bold text-[#0B1120] no-underline shadow-md transition-all hover:bg-emerald-400"
                href={downloadUrl}
              >
                Download .apkg File
              </Button>
              <Text className="text-[12px] text-gray-500 mt-3 block">
                Link active securely via your account profile.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-8 border-t border-gray-800 pt-6">
              <Text className="m-0 text-[13px] leading-[22px] text-gray-500">
                Need assistance importing this deck into Anki or have questions about the syllabus coverage? Reply directly to this email and we'll get you sorted.
              </Text>
              <Text className="m-0 mt-4 text-[11px] tracking-wide text-gray-600 uppercase font-semibold">
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