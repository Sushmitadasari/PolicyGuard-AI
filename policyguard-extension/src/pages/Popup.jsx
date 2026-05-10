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

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  <div className="lg:col-span-2">
    <SummaryCard summary={mockAnalysis.summary} />

    <div className="mt-6">
      <h2 className="font-semibold mb-4 text-xl">
        Detected Risks
      </h2>

      {mockAnalysis.risks.map((risk, index) => (
        <ClauseCard
          key={index}
          risk={risk}
        />
      ))}
    </div>
  </div>

  <div>
    <WebsiteCard website={mockAnalysis.website} />

    <div className="mt-6">
      <RiskMeter
        score={mockAnalysis.riskScore}
        level={mockAnalysis.riskLevel}
      />
    </div>

    <div className="mt-6">
      <RecommendationCard
        recommendations={mockAnalysis.recommendations}
      />
    </div>

    <FooterButtons />
  </div>

</div>
</div>
  )
}

export default Popup;