import logo from '../assets/logo.png';

function Header() {
  return (
    <header className="flex items-center justify-center px-6 py-4 bg-red-600 text-white shadow-md">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Logo Construindo o Saber" className="h-6 w-auto" />
        <h1 className="text-2xl font-bold">Construindo o Saber</h1>
      </div>
    </header>
  );
}

export default Header;
