import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import React from "react";

export default function RotinaPedagogica() {
  const [criancas, setCriancas] = useState<any[]>([]);
  const [criancaSelecionada, setCriancaSelecionada] = useState<string>('');
  const [propostaPedagogica, setPropostaPedagogica] = useState("");
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]); // SÓ UMA DECLARAÇÃO
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alimentacao, setAlimentacao] = useState({
    lanche_manha: "",
    almoco: "",
    lanche_tarde: "",
    fruta: { status: "", observacao: "" },
    mamadeira_gt1: "",
  });

  const [higiene, setHigiene] = useState({
    xixi: false,
    coco: "",
    observacao: "",
  });

  const [rotinaPedagogica, setRotinaPedagogica] = useState({
    brincadeiras: false,
    interacao: false,
    incidente: false,
    observacao: "",
  });

  const [faltaInsumos, setFaltaInsumos] = useState({
    fralda_descartavel: false,
    lenco_umedecido: false,
    roupa_extra: false,
    protetor_solar: false,
    repelente: false,
    fruta_semana: false,
    observacao: "",
  });

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
  const carregarCriancas = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user?.id) {
      console.error("Usuário não autenticado.");
      return;
    }

    const userId = sessionData.session.user.id;

    // Busca a turma da colaboradora logada
    const { data: colaboradoras, error: colabError } = await supabase
      .from("colaboradoras")
      .select("turma")
      .eq("user_id", userId)
      .single();

    if (colabError || !colaboradoras) {
      console.error("Erro ao buscar colaboradora:", colabError?.message);
      return;
    }

    const turma = colaboradoras.turma;
    console.log("Turma da colaboradora:", turma);

    // Busca as crianças da mesma turma
    const { data: criancasData, error: criancasError } = await supabase
      .from("criancas")
      .select("id, nome")
      .eq("turma", turma);

    if (criancasError) {
      console.error("Erro ao buscar crianças:", criancasError.message);
    } else {
      console.log("Crianças da turma:", criancasData); // <- AQUI!
      setCriancas(criancasData || []);
    }
  };

  carregarCriancas();
}, []);


  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAnexos(files);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMensagem("");
  setIsSubmitting(true);

  try {
    // Busca dados da criança selecionada
    const { data: crianca, error: criancaError } = await supabase
      .from("criancas")
      .select("nome, id, cpf_responsavel, turma")
      .eq("id", criancaSelecionada)
      .single();

    if (criancaError || !crianca) {
      console.error("Erro ao buscar criança:", criancaError?.message);
      alert("Criança não encontrada");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user?.id) {
      console.error("Usuário não autenticado.");
      setMensagem("Erro: usuário não autenticado.");
      return;
    }

    const userId = sessionData.session.user.id;

    // Upload dos anexos
    const urlsAnexos: string[] = [];

    for (const file of anexos) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("anexos-rotina")
        .upload(fileName, file, {
          contentType: file.type, // <- CORRIGIDO AQUI
        });

      if (uploadError) {
        console.error("Erro ao fazer upload:", uploadError.message);
        setMensagem("Erro ao fazer upload dos arquivos.");
        return;
      }

      const urlPublica = `https://qiktmezhuxvwvsdasgst.supabase.co/storage/v1/object/public/anexos-rotina/${uploadData.path}`;
      urlsAnexos.push(urlPublica);
    }

    // Monta o objeto para salvar
    const rotinaData = {
      nome: crianca.nome,
      user_id: userId,
      cpf_responsavel: crianca.cpf_responsavel,
      turma: crianca.turma,
      criado_em: new Date().toISOString(),
      alimentacao,
      higiene,
      rotina_pedagogica: rotinaPedagogica,
      proposta_pedagogica: propostaPedagogica,
      falta_insumos: faltaInsumos,
      observacoes_gerais: observacoesGerais,
      anexos: urlsAnexos,
    };

    const { error: insertError } = await supabase.from("rotina_pedagogica").insert([rotinaData]);

    if (insertError) {
      console.error("Erro ao salvar rotina:", insertError.message);
      setMensagem("Erro ao salvar. Tente novamente.");
    } else {
      setMensagem("Checklist salvo com sucesso!");
      // Limpa os campos
      setCriancaSelecionada("");
      setAlimentacao({
        lanche_manha: "",
        almoco: "",
        lanche_tarde: "",
        fruta: { status: "", observacao: "" },
        mamadeira_gt1: "",
      });
      setHigiene({
        xixi: false,
        coco: "",
        observacao: "",
      });
      setRotinaPedagogica({
        brincadeiras: false,
        interacao: false,
        incidente: false,
        observacao: "",
      });
      setFaltaInsumos({
        fralda_descartavel: false,
        lenco_umedecido: false,
        roupa_extra: false,
        protetor_solar: false,
        repelente: false,
        fruta_semana: false,
        observacao: "",
      });
      setPropostaPedagogica("");
      setObservacoesGerais("");
      setAnexos([]);
    }
  } catch (err) {
    console.error("Erro inesperado:", err);
    setMensagem("Erro inesperado. Tente novamente.");
  } finally {
    setIsSubmitting(false);
  }
  
};


  return (
    <div className="page-container p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">Rotina Pedagógica</h2>
  
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção da criança */}
        <label className="block">
          <span className="text-gray-700">Selecione a criança:</span>
          <select
          id="crianca"
            value={criancaSelecionada}
            onChange={(e) => setCriancaSelecionada(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            required
          >
            <option value="">Selecione...</option>
            {criancas.map((crianca) => (
              <option key={crianca.id} value={crianca.id}>
                {crianca.nome}
              </option>
            ))}
          </select>
        </label>
  
        {/* Alimentação */}
        <div className="mb-6">
  <h3 className="text-lg font-semibold flex items-center text-purple-600">
    🍽️ Alimentação
  </h3>
  <ul className="space-y-2 mt-2">
    <li className="flex flex-col">
      <label>Lanche da manhã:</label>
      <select className="border rounded p-1">
        <option value="">Selecione...</option>
        <option value="comeu_bem">Comeu bem</option>
        <option value="razoavel">Razoável</option>
        <option value="nao_aceitou">Não aceitou</option>
      </select>
    </li>
    <li className="flex flex-col">
      <label>Almoço:</label>
      <select className="border rounded p-1">
        <option value="">Selecione...</option>
        <option value="comeu_bem">Comeu bem</option>
        <option value="razoavel">Razoável</option>
        <option value="nao_aceitou">Não aceitou</option>
      </select>
    </li>
    <li className="flex flex-col">
      <label>Lanche da tarde:</label>
      <select className="border rounded p-1">
        <option value="">Selecione...</option>
        <option value="comeu_bem">Comeu bem</option>
        <option value="razoavel">Razoável</option>
        <option value="nao_aceitou">Não aceitou</option>
      </select>
    </li>
    <li className="flex flex-col">
      <label>Fruta:</label>
      <select className="border rounded p-1">
        <option value="">Selecione...</option>
        <option value="comeu_bem">Comeu bem</option>
        <option value="razoavel">Razoável</option>
        <option value="nao_aceitou">Não aceitou</option>
      </select>
    </li>
    <li className="flex flex-col">
      <label>Observação da fruta:</label>
      <input type="text" className="border rounded p-1" maxLength={50} />
    </li>
    <li className="flex flex-col">
      <label>Mamadeira (GT1):</label>
      <select className="border rounded p-1">
        <option value="">Selecione...</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
    </li>
  </ul>
</div>

  
        {/* Higiene */}
        <div>
          <h3 className="text-lg font-semibold mb-2">🧼 Higiene</h3>
  
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={Boolean(higiene.xixi)}

              onChange={(e) => setHigiene({ ...higiene, xixi: e.target.checked })}
            />
            <span className="ml-2">Xixi</span>
          </label>
  
          <label className="block mb-2">
            Cocô:
            <select
              className="block mt-1 w-full"
              value={higiene.coco}
              onChange={(e) => setHigiene({ ...higiene, coco: e.target.value })}
            >
              <option value="">Selecione</option>
              <option value="evacuou">Evacuou</option>
              <option value="nao_evacuou">Não evacuou</option>
              <option value="diarreia">Diarreia</option>
            </select>
          </label>
  
          <label className="block mb-2">
            Observação:
            <input
              type="text"
              className="w-full border rounded p-2 mt-1"
              value={higiene.observacao}
              onChange={(e) => setHigiene({ ...higiene, observacao: e.target.value })}
            />
          </label>
        </div>
  
        {/* Rotina Pedagógica */}
        <div>
          <h3 className="text-lg font-semibold mb-2">📚 Rotina Pedagógica</h3>
  
          {[
            ["brincadeiras", "Brincadeiras"],
            ["interacao", "Interação"],
            ["incidente", "Houve incidente"],
          ].map(([key, label]) => (
            <label key={key} className="block mb-2">
              <input
                type="checkbox"
                checked={Boolean(rotinaPedagogica[key as keyof typeof rotinaPedagogica])}

                onChange={(e) =>
                  setRotinaPedagogica({
                    ...rotinaPedagogica,
                    [key as keyof typeof rotinaPedagogica]: e.target.checked,
                  })
                }
              />
              <span className="ml-2">{label}</span>
            </label>
          ))}
  
          <label className="block mb-2">
            Observação:
            <input
              type="text"
              className="w-full border rounded p-2 mt-1"
              value={rotinaPedagogica.observacao}
              onChange={(e) =>
                setRotinaPedagogica({ ...rotinaPedagogica, observacao: e.target.value })
              }
            />
          </label>
        </div>
  
        {/* Falta de Insumos */}
        <div className="mb-6">
  <h3 className="text-lg font-semibold text-red-600 flex items-center">🔔 Falta de Insumos</h3>
  <ul className="space-y-2 mt-2">
    <li>
      <label><input type="checkbox" className="mr-2" />Fralda descartável</label>
    </li>
    <li>
      <label><input type="checkbox" className="mr-2" />Lenço umedecido</label>
    </li>
    <li>
      <label><input type="checkbox" className="mr-2" />Roupa extra</label>
    </li>
    <li>
      <label><input type="checkbox" className="mr-2" />Protetor solar</label>
    </li>
    <li>
      <label><input type="checkbox" className="mr-2" />Repelente</label>
    </li>
    <li>
      <label><input type="checkbox" className="mr-2" />Fruta da semana</label>
    </li>
    <li className="flex flex-col">
      <label>Observação:</label>
      <input type="text" className="border rounded p-1" />
    </li>
  </ul>
</div>
  
        {/* Anexos */}
        <div>
          <h3 className="text-lg font-semibold mb-2">📎 Anexos (Fotos, Vídeos, PDFs)</h3>
          <input
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
          {anexos.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-gray-700 mt-2">
              {anexos.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
  
        {/* Botão de envio */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Checklist"}
        </button>
  
        {/* Mensagem de status */}
        {mensagem && (
          <div
            className={`mt-4 p-2 text-center font-semibold rounded ${
              mensagem.includes("sucesso")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {mensagem}
          </div>
        )}
      </form>
    </div>
  );
}  