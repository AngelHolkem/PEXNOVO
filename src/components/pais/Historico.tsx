import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import FeedbackPais from "./FeedbackPais";
import { FaAppleAlt, FaUtensils, FaIceCream, FaBaby, FaToilet, FaCommentDots, FaFilePdf, FaImage, FaVideo } from 'react-icons/fa'; // Ícones

interface Registro {
  id: string;
  criado_em: string;
  alimentacao?: {
    lanche_manha: string;
    almoco: string;
    lanche_tarde: string;
    fruta: {
      status: string;
      observacao: string;
    };
    mamadeira_gt1: string;
  };
  higiene?: {
    xixi: boolean;
    coco: string;
    observacao: string;
  };
  rotina_pedagogica?: {
    brincadeiras: boolean;
    interacao: boolean;
    incidente: boolean;
    observacao: string;
  };
  proposta_pedagogica?: {
    status: 'Realizada satisfatoriamente' | 'Realizada Parcialmente' | 'Não realizada';
    observacao: string;
  };
  falta_de_insumos?: {
    fralda_descartavel: boolean;
    lenco_umedecido: boolean;
    roupa_extra: boolean;
    protetor_solar: boolean;
    repelente: boolean;
    fruta_semana: boolean;
    observacao: string;
  };
  observacoes_gerais?: string;
  anexos?: string[];
}

export default function Historico() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      const cpfDoFilho = email?.split('@')[0]; // Extrai o CPF antes do @

const cpf = localStorage.getItem("cpf_responsavel");

const { data: criancaData } = await supabase
  .from("criancas")
  .select("id, nome")
  .eq("cpf_responsavel", cpf)


      const { data, error } = await supabase

        .from('rotina_pedagogica')
        .select('*')
        .eq('cpf_responsavel', cpf        )
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRegistros(data);
      }
      setLoading(false);
    };

    fetchRegistros();
  }, []);

  if (loading) return <p className="text-center">Carregando registros...</p>;

  return (
    <div className="page-container">
    <h2 className="text-2xl font-semibold text-blue-700 mb-4">Histórico</h2>
    
      {registros.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum registro encontrado.</p>
      ) : (
        registros.map((registro) => (
          <div key={registro.id} className="p-4 border rounded-lg shadow-md bg-white space-y-4">
            <p className="text-sm text-gray-500">
              Data: {new Date(registro.criado_em).toLocaleDateString()}
            </p>

            {/* Alimentação */}
            {registro.alimentacao && (
              <div>
                <div className="flex items-center mb-2">
                  <FaUtensils className="text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-700">Alimentação</h3>
                </div>
                <ul className="list-none text-sm text-gray-700 space-y-1 ml-6">
                  <li><FaIceCream className="inline mr-1 text-pink-500" /> Lanche da manhã: {registro.alimentacao.lanche_manha || "Não informado"}</li>
                  <li><FaUtensils className="inline mr-1 text-green-500" /> Almoço: {registro.alimentacao.almoco || "Não informado"}</li>
                  <li><FaIceCream className="inline mr-1 text-yellow-500" /> Lanche da tarde: {registro.alimentacao.lanche_tarde || "Não informado"}</li>
                  <li><FaAppleAlt className="inline mr-1 text-red-500" /> Fruta: {registro.alimentacao.fruta?.status || "Não informado"}</li>
                  {registro.alimentacao.fruta?.observacao && (
                    <li><FaCommentDots className="inline mr-1 text-gray-600" /> Obs. Fruta: {registro.alimentacao.fruta.observacao}</li>
                  )}
                  {registro.alimentacao.mamadeira_gt1 && (
                    <li><FaBaby className="inline mr-1 text-purple-500" /> Mamadeira (GT1): {registro.alimentacao.mamadeira_gt1}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Higiene */}
            {registro.higiene && (
              <div>
                <div className="flex items-center mb-2 mt-4">
                  <FaToilet className="text-indigo-600 mr-2" />
                  <h3 className="font-semibold text-blue-700">Higiene</h3>
                </div>
                <ul className="list-none text-sm text-gray-700 space-y-1 ml-6">
                  <li><FaToilet className="inline mr-1 text-indigo-500" /> Xixi: {registro.higiene.xixi ? "Sim" : "Não"}</li>
                  <li><FaToilet className="inline mr-1 text-indigo-400" /> Cocô: {registro.higiene.coco || "Não informado"}</li>
                  {registro.higiene.observacao && (
                    <li><FaCommentDots className="inline mr-1 text-gray-600" /> Obs. Higiene: {registro.higiene.observacao}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Rotina Pedagógica */}
{registro.rotina_pedagogica && (
  <div>
    <div className="flex items-center mb-2 mt-4">
      <h3 className="font-semibold text-blue-700">Rotina Pedagógica</h3>
    </div>
    <ul className="list-disc text-sm text-gray-700 ml-6">
      <li>Brincadeiras: {registro.rotina_pedagogica.brincadeiras ? 'Sim' : 'Não'}</li>
      <li>Interação: {registro.rotina_pedagogica.interacao ? 'Sim' : 'Não'}</li>
      <li>Incidente: {registro.rotina_pedagogica.incidente ? 'Sim' : 'Não'}</li>
      {registro.rotina_pedagogica.observacao && (
        <li>Obs: {registro.rotina_pedagogica.observacao}</li>
      )}
    </ul>
  </div>
)}
{/* Proposta Pedagógica */}
{registro.proposta_pedagogica && (
  <div className="mt-4">
    <div className="flex items-center mb-2">
      <h3 className="font-semibold text-blue-700">Proposta Pedagógica</h3>
    </div>
    <p className="text-sm text-gray-700 ml-6">
      Status: {registro.proposta_pedagogica.status}
    </p>
    {registro.proposta_pedagogica.observacao && (
      <p className="text-sm text-gray-700 ml-6">Obs: {registro.proposta_pedagogica.observacao}</p>
    )}
  </div>
)}



            {/* Observações Gerais */}
            {registro.observacoes_gerais && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <FaCommentDots className="text-gray-600 mr-2" />
                  <h3 className="font-semibold text-blue-700">Observações Gerais</h3>
                </div>
                <p className="text-sm text-gray-700 ml-6">{registro.observacoes_gerais}</p>
              </div>
            )}

            {/* Anexos */}
            {registro.anexos && registro.anexos.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-blue-700 mb-2">Anexos</h3>
                <div className="flex flex-wrap gap-4">
                  {registro.anexos.map((url, i) => {
                    const isImage = url.match(/\.(jpeg|jpg|png|gif)$/i);
                    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                    const isPdf = url.match(/\.pdf$/i);

                    return (
                      <div key={i} className="w-32">
                        {isImage && (
                          <div>
                            <FaImage className="text-green-500 mb-1" />
                            <img src={url} alt={`Anexo ${i}`} className="rounded w-full h-auto" />
                          </div>
                        )}
                        {isVideo && (
                          <div>
                            <FaVideo className="text-purple-500 mb-1" />
                            <video controls className="rounded w-full h-auto">
                              <source src={url} type="video/mp4" />
                              Seu navegador não suporta vídeo.
                            </video>
                          </div>
                        )}
                        {isPdf && (
                          <div>
                            <FaFilePdf className="text-red-500 mb-1" />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline text-sm"
                            >
                              Ver PDF
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback dos Pais */}
            <FeedbackPais registroId={registro.id} />
          </div>
        ))
      )}
    </div>
  );
}
