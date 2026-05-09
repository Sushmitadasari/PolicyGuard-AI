const WebsiteCard = ({ website }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 backdrop-blur-lg">
      <p className="text-gray-400 text-sm">Current Website</p>

      <h2 className="text-xl font-bold mt-2">
        {website}
      </h2>

      <div className="mt-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm text-green-400">
          Active Scan
        </span>
      </div>
    </div>
  )
}

export default WebsiteCard;