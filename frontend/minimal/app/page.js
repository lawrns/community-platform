export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Minimal Next.js App</h1>
      <p style={{ marginBottom: '1rem' }}>
        This is a minimal Next.js app to test deployment on Vercel.
      </p>
      <div style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Deployment Test</h2>
        <p>If you can see this page, the minimal Next.js app is working correctly!</p>
      </div>
    </div>
  )
}
