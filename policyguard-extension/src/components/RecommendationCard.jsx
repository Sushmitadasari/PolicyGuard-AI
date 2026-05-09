const RecommendationCard = ({ recommendations }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
      <h2 className="font-semibold mb-4">
        Recommendations
      </h2>

      <ul className="space-y-3">
        {recommendations.map((item, index) => (
          <li
            key={index}
            className="text-sm text-gray-300"
          >
            • {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecommendationCard;