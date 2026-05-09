const WarningBanner = () => {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-5 py-3 rounded-2xl shadow-2xl z-50">
      <h2 className="font-bold">
        ⚠ HIGH PRIVACY RISK
      </h2>

      <p className="text-sm mt-1">
        This website may collect sensitive user data.
      </p>
    </div>
  )
}

export default WarningBanner;