import Sidebar from '../components/common/Sidebar'
import Navbar from '../components/common/Navbar'

const ReviewerLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  </div>
)

export default ReviewerLayout
