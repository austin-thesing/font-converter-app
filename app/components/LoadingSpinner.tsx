const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    <p className="mt-4 text-lg text-gray-600">Loading Font Converter...</p>
  </div>
);

export default LoadingSpinner;