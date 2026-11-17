import Loader from '../components/Loader';

export default function DashboardLoader() {
  return (
    <Loader 
      size="large" 
      text="Loading Dashboard" 
      description="Please wait while we fetch live onsite staff data" 
    />
  );
}