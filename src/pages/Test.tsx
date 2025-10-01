import React from 'react';

const Test = () => {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
      <h1>🚀 TEST PAGE - LA APLICACIÓN ESTÁ FUNCIONANDO</h1>
      <p>Si ves este mensaje, React está cargando correctamente.</p>
      <p>Hora actual: {new Date().toLocaleString()}</p>
      <a href="/dashboard">Ir al Dashboard</a>
    </div>
  );
};

export default Test;