import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CadastroColaboradora() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleCadastro = async (e: React.FormEvent) => {
  e.preventDefault();
  setErro("");
  setSucesso("");

  if (senha !== confirmarSenha) {
    setErro("As senhas não coincidem.");
    return;
  }

  const email = `${cpf}@construindo.com`;

  // 1. Criar conta no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: senha,
  });

  if (authError) {
    setErro("Erro ao criar conta: " + authError.message);
    return;
  }

  // 2. Login automático para passar na RLS
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (loginError) {
    setErro("Erro ao autenticar após o cadastro: " + loginError.message);
    return;
  }

  const userId = loginData.user?.id;

  if (!userId) {
    setErro("Erro inesperado ao obter ID do usuário.");
    return;
  }

  // 3. Inserir perfil com tipo "colaboradora"
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: userId,
      cpf: cpf,
      tipo: "colaboradora",
      criado_em: new Date().toISOString(),
    },
  ]);

  if (profileError) {
    setErro("Erro ao salvar perfil: " + profileError.message);
    return;
  }

  setSucesso("Cadastro realizado com sucesso!");
  setCpf("");
  setSenha("");
  setConfirmarSenha("");
};

return (
  <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
    <h2 className="text-xl font-semibold mb-4 text-center">Cadastrar Colaboradora</h2>
    <form onSubmit={handleCadastro}>
      <div className="mb-4">
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
        <input
          id="cpf"
          type="text"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
        <input
          id="confirmarSenha"
          type="password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      {erro && <p className="text-red-600 text-sm mb-4">{erro}</p>}
      {sucesso && <p className="text-green-600 text-sm mb-4">{sucesso}</p>}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Cadastrar
      </button>
    </form>
  </div>
);
}
