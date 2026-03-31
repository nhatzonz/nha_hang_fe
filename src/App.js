import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<h1>Hệ thống quản lý nhà hàng</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
