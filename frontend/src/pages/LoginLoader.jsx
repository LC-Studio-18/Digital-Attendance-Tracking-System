import Loader from '../components/Loader';

export default function LoginLoader() {
  return (
    <Loader 
      size="large" 
      text="Signing In" 
      description="Please wait while we verify your credentials" 
    />
  );
}