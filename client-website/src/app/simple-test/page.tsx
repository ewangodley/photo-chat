export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-red-500 text-white p-8">
      <h1 className="text-4xl font-bold">CSS Test Page</h1>
      <p className="text-xl mt-4">If you see red background, Tailwind is working</p>
      <div className="bg-blue-500 p-4 mt-4 rounded-lg">
        <p>This should be blue with rounded corners</p>
      </div>
    </div>
  )
}