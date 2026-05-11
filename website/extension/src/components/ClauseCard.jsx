import React from "react";
import { AlertTriangle } from "lucide-react"

const ClauseCard = ({ risk }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-400 mt-1" />

        <div>
          <h3 className="font-semibold text-red-300">
            {risk.title}
          </h3>

          <p className="text-xs text-red-400 mt-1">
            Severity: {risk.severity}
          </p>

          <p className="text-sm text-gray-300 mt-3 leading-6">
            {risk.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClauseCard;