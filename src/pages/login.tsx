import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    const email = `${cpf}@construindo.com`;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError) {
      console.error("Erro de login:", authError.message);
      setErro("CPF ou senha inválidos");
      return;
    }

    const userId = authData.user.id;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("tipo")
      .eq("id", userId)
      .single();

    if (profileError || !profileData) {
      console.error("Erro ao buscar perfil:", profileError?.message);
      setErro("Erro ao encontrar o perfil do usuário.");
      return;
    }

    if (profileData.tipo === "pai") {
    localStorage.setItem("cpf_responsavel", cpf);
      navigate("/pais");
    } else if (profileData.tipo === "colaboradora") {
      navigate("/colaboradora");
    } else {
      console.error("Tipo de usuário inválido:", profileData.tipo);
      setErro("Tipo de usuário não permitido.");
    }

  }

  return (
    <div className="max-w-3xl w-full px-6 py-8 bg-white bg-opacity-90 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="cpf" className="block mb-2 text-sm font-medium text-gray-700">
            CPF da criança:
          </label>
          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-700">
            Senha:
          </label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {erro && <p className="text-red-600 text-sm mb-2">{erro}</p>}
        {mensagem && <p className="text-green-600 text-sm mb-2">{mensagem}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
      </div>
  )
}
