"""Validation constants and configuration"""

# Validation parameter groups for parallel analysis
VALIDATION_PARAMETER_GROUPS = [
    {
        "group_id": "market",
        "parameters": [
            ("market_opportunity", "Market Opportunity"),
            ("target_audience_clarity", "Target Audience Clarity"),
            ("go_to_market_strategy", "Go-to-Market Strategy")
        ],
        "context": "Market viability and audience analysis"
    },
    {
        "group_id": "product",
        "parameters": [
            ("problem_solution_fit", "Problem-Solution Fit"),
            ("competitive_landscape", "Competitive Landscape"),
            ("technical_feasibility", "Technical Feasibility"),
            ("scalability_potential", "Scalability Potential")
        ],
        "context": "Product-market fit and technical viability"
    },
    {
        "group_id": "execution",
        "parameters": [
            ("business_model_viability", "Business Model Viability"),
            ("financial_sustainability", "Financial Sustainability"),
            ("risk_assessment", "Risk Assessment")
        ],
        "context": "Execution feasibility and sustainability"
    }
]

