import React from 'react';

function App() {
  const testingNode = async () => {
    const response = await fetch('http://localhost:5000');
    console.log(response)
    const body = await response.json();
    console.log(body)
  }

  return (
    <>
    <h1>Hello world !</h1>
    <button onClick={testingNode}>Click Me</button>
    </>
  );
}

export default App;
