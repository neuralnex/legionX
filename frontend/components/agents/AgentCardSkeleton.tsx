const AgentCardSkeleton = () => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-800"></div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="h-5 bg-gray-800 rounded w-2/3"></div>
          <div className="h-4 bg-gray-800 rounded w-8"></div>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-3"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
          <div className="h-3 bg-gray-800 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  )
}

export default AgentCardSkeleton
