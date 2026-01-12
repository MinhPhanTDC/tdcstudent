import StudentDetailClient from './StudentDetailClient';

// Generate a placeholder for static export
// Firebase Hosting rewrites will handle actual routing
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function StudentDetailPage() {
  return <StudentDetailClient />;
}
