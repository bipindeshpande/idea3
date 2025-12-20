/**
 * HeroSection - Home page hero
 * Uses standardized HeroSection wrapper
 */

import HeroSection from "../../../components/marketing/sections/HeroSection.jsx";

export default function HomeHeroSection({ data, ...props }) {
  return <HeroSection data={data} {...props} />;
}
