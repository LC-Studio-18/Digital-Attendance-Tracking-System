import Loader from '../components/Loader';

export default function AttendanceLoader() {
  return (
    <Loader 
      size="large" 
      text="Processing" 
      description="Please wait here while we record your attendance" 
    />
  );
}