
import React from 'react';
import FormBuilder from './components/FormBuilder';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <FormBuilder />
    </div>
  );
}

export default App;