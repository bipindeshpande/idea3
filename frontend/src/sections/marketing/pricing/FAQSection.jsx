import Card from "../../../components/ui/Card.jsx";
import SectionHeader from "../../../components/marketing/SectionHeader.jsx";
import UIHeading from "../../../components/ui/ui-heading.jsx";

export default function FAQSection({ faqs }) {
  return (
    <section className="relative py-12">
      <Card className="marketing-card-blue">
        <SectionHeader title="Frequently Asked Questions" center className="mb-8" />
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i}>
              <UIHeading level="h3" className="marketing-card-title text-primary mb-2">{faq.question}</UIHeading>
              <p className="mkt-body text-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

