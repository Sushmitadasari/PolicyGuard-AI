import { ShieldCheck } from "lucide-react"

const Header = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-purple-600 p-2 rounded-xl">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold">POLICYGUARD AI</h1>
          <p className="text-xs text-gray-400">
            AI Privacy Intelligence
          </p>
        </div>
      </div>

      <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
        LIVE
      </div>
    </div>
  )
}

export default Header;