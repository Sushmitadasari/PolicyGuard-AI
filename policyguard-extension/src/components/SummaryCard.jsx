const SummaryCard = ({ summary }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
      <h2 className="font-semibold mb-3">
        AI Summary
      </h2>

      <p className="text-gray-300 leading-7 text-sm">
        {summary}
      </p>
    </div>
  )
}

export default SummaryCard;