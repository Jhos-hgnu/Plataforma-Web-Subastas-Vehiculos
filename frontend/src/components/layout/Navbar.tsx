import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { session, logout } = useAuth(); const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <header className="navbar"><div className="nav-inner">
    <Link className="brand" to="/" onClick={close}>Auto<span>Bid</span></Link>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menú">☰</button>
    <nav className={open ? 'nav-links open' : 'nav-links'} onClick={close}>
      <NavLink to="/">Inicio</NavLink><a href="/#inventory">Inventario</a>
      <NavLink to="/publish">Publicar</NavLink><NavLink to="/my-vehicles">Mis vehículos</NavLink>
      {session ? <><span className="user-email">{session.email}</span><button className="link-button" onClick={logout}>Cerrar sesión</button></> : <><NavLink to="/login">Iniciar sesión</NavLink><NavLink className="register-link" to="/register">Registrarse</NavLink></>}
    </nav>
  </div></header>;
}
