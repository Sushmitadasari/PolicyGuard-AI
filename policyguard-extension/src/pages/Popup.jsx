import Header from "../components/Header"
import WebsiteCard from "../components/WebsiteCard"
import RiskMeter from "../components/RiskMeter"
import SummaryCard from "../components/SummaryCard"
import ClauseCard from "../components/ClauseCard"
import RecommendationCard from "../components/RecommendationCard"
import FooterButtons from "../components/FooterButtons"

import { mockAnalysis } from "../data/mockData"

const Popup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] to-[#111827] text-white p-5 w-[380px]">
      <Header />

      <WebsiteCard website={mockAnalysis.website} />

      <RiskMeter
        score={mockAnalysis.riskScore}
        level={mockAnalysis.riskLevel}
      />

      <SummaryCard summary={mockAnalysis.summary} />

      <div className="mb-5">
        <h2 className="font-semibold mb-4">
          Detected Risks
        </h2>

        {mockAnalysis.risks.map((risk, index) => (
          <ClauseCard
            key={index}
            risk={risk}
          />
        ))}
      </div>

      <RecommendationCard
        recommendations={mockAnalysis.recommendations}
      />

      <FooterButtons />
    </div>
  )
}

export default Popup;