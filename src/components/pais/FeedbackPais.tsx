import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface FeedbackProps {
  registroId: string; // ID do registro da rotina pedagógica
}

interface Feedback {
  id: string;
  mensagem: string;
  anexos: string[];
  created_at: string;
}

export default function FeedbackPais({ registroId }: FeedbackProps) {
  const [observacao, setObservacao] = useState("");
  const [arquivos, setArquivos] = useState<FileList | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // 🔄 Função para buscar feedbacks (fora do useEffect)
  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedback_pais")
      .select("*")
      .eq("registro_id", registroId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar feedbacks:", error);
    } else {
      setFeedbacks(data as Feedback[]);
    }
  };

  useEffect(() => {
    if (registroId) fetchFeedbacks();
  }, [registroId]);

  const enviarFeedback = async () => {
    setEnviando(true);
    setMensagem("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId || !registroId) {
      setMensagem("Usuário ou registro não encontrado.");
      setEnviando(false);
      return;
    }

    // 📂 Upload dos arquivos
    const urls: string[] = [];

    if (arquivos) {
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        const nomeArquivo = `${userId}/${uuidv4()}-${arquivo.name}`;

        const { error } = await supabase.storage
          .from("anexos-feedback")
          .upload(nomeArquivo, arquivo);

        if (error) {
          console.error("Erro no upload:", error.message);
          setMensagem("Erro ao enviar arquivo.");
          setEnviando(false);
          return;
        }

        const url = supabase.storage
          .from("anexos-feedback")
          .getPublicUrl(nomeArquivo).data.publicUrl;

        urls.push(url);
      }
    }

    // 📝 Envio do feedback para a tabela
    const { error: insertError } = await supabase
      .from("feedback_pais")
      .insert([
        {
          user_id: userId,
          registro_id: registroId,
          mensagem: observacao, // 💡 Aqui é "mensagem" agora!
          anexos: urls.length > 0 ? urls : null,
        },
      ]);

    if (insertError) {
      console.error(insertError);
      setMensagem("Erro ao salvar feedback.");
    } else {
      setMensagem("Feedback enviado com sucesso!");
      setObservacao("");
      setArquivos(null);
      await fetchFeedbacks(); // 🔄 Atualiza a lista após envio
    }

    setEnviando(false);
  };

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm mt-4">
      <h2 className="text-lg font-semibold mb-2">Deixe seu feedback</h2>

      <textarea
        className="w-full border p-2 rounded mb-2"
        rows={4}
        placeholder="Escreva sua observação..."
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={(e) => setArquivos(e.target.files)}
        className="mb-2"
      />

      <button
        onClick={enviarFeedback}
        disabled={enviando}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {enviando ? "Enviando..." : "Enviar Feedback"}
      </button>

      <hr className="my-4" />
      <h3 className="text-md font-semibold mb-2">Feedbacks enviados</h3>

      {feedbacks.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum feedback enviado ainda.</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} className="mb-4 p-3 bg-gray-100 rounded">
            <p className="mb-2">{fb.mensagem}</p>

            {fb.anexos?.length > 0 && (
              <div className="space-y-1">
                {fb.anexos.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm block"
                  >
                    Ver anexo {i + 1}
                  </a>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-2">
              Enviado em: {new Date(fb.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
        ))
      )}

      {mensagem && <p className="mt-2 text-sm">{mensagem}</p>}
    </div>
  );
}
