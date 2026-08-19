import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to your Dashboard, {user?.name}!
        </h1>
        <p className="text-gray-600">
          This is a protected route. Only logged-in users can see this.
          In Phase 2, we will add the ability to link your CP profiles here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
