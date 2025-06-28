export default function Home() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1 style={{ color: 'darkblue', fontSize: '32px' }}>
        🎯 TEST PAGINA
      </h1>
      <p style={{ fontSize: '18px', color: 'darkblue' }}>
        Als je dit ziet, werkt de applicatie!
      </p>
      <div style={{ backgroundColor: 'white', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h2>✅ Status: Werkend</h2>
        <p>De Next.js applicatie draait correct.</p>
      </div>
    </div>
  )
}