import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchData, connectWallet } from './actions';
import { Routes, Route } from "react-router-dom"
import Header from './layouts/Header'
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Drop from './components/Drop'
import './styles/custom.css'

function App() {
  const dispatch = useDispatch();

  dispatch(fetchData());
  useEffect(()=>{
      dispatch(connectWallet());
      //dispatch(fetchData());
  },[dispatch]);

  return (
    <>
      <Header/>
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/drop/:dropId" element={ <Drop /> } />
          <Route path="about" element={ <About /> } />
          <Route path="contact" element={ <Contact /> } />
          <Route path="profile" element={ <Profile /> } />
        </Routes>
      </div>
    </>
  );
}

export default App