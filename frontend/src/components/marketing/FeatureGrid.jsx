import Card from "../ui/Card.jsx";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * FeatureGrid - Grid of feature cards with color tints
 */
export default function FeatureGrid({ features, columns = 3, className = "" }) {
  const colorClasses = [
    "marketing-card-blue",
    "marketing-card-purple",
    "marketing-card-orange",
    "marketing-card-teal",
    "marketing-card-red",
  ];

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns]} ${className}`}>
      {features.map((feature, index) => {
        const colorClass = colorClasses[index % colorClasses.length];
        return (
          <Card
            key={feature.title || index}
            className={`marketing-feature-card ${colorClass} marketing-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {feature.icon && (
              <div className="marketing-icon-circle mb-4 mx-auto">
                <span className="text-2xl">{feature.icon}</span>
              </div>
            )}
            {feature.title && (
              <UIHeading level="h3" className="marketing-card-title text-primary mb-2 text-center">
                {feature.title}
              </UIHeading>
            )}
            {feature.description && (
              <p className="text-base text-secondary text-center leading-relaxed">
                {feature.description}
              </p>
            )}
            {feature.children}
          </Card>
        );
      })}
    </div>
  );
}

