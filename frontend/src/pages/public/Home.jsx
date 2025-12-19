import Seo from "../../components/common/Seo.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import {
  HeroSection,
  // SocialProofSection,
  // PersonaGridSection,
  // ClarityMattersSection,
  // HowItWorksSection,
  // SeeInActionSection,
  // WhatYouGetSection,
  // FinalCTASection
} from "../../sections/marketing/home";
import {
  seo,
  heroData,
  // personas,
  // clarityMattersItems,
  // howItWorksSteps,
  // seeInActionBlocks,
  // whatYouGetItems,
  // finalCTAData
} from "../../data/marketing/home.js";

export default function HomePage() {
  return (
    <MarketingLayout fullWidth={true}>
      <Seo {...seo} />
      
      <HeroSection data={heroData} />
      {/* <SocialProofSection /> */}
      {/* <PersonaGridSection personas={personas} /> */}
      {/* <ClarityMattersSection items={clarityMattersItems} /> */}
      {/* <HowItWorksSection steps={howItWorksSteps} /> */}
      {/* <SeeInActionSection blocks={seeInActionBlocks} /> */}
      {/* <WhatYouGetSection items={whatYouGetItems} /> */}
      {/* <FinalCTASection data={finalCTAData} /> */}
    </MarketingLayout>
  );
}
