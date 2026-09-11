import { TranslatorContainer } from '@/components/translator/TranslatorContainer';

export const metadata = {
  title: 'Real-Time Voice Translator | English ↔ Français',
  description: 'Instantaneous conversational English to French voice interpreter powered by OpenAI Realtime WebRTC.',
};

export default function Home() {
  return <TranslatorContainer />;
}
