export interface ProductProps {
  data: ProductDTO;
}

export type ProductDTO = {
  produto_id: string;
  cod_barras: string;
  descricao_completa: string;
  descricao: string;
  apresentacao: string;
  apresentacao_tipo: string;
  apresentacao_tipo_abrev: string;
  apresentacao_qtd: string;
  grupo: string;
  marca: string;
  tipo_id: string;
  tipo: string;
  ncm: string;
  ncm_descricao: string;
  fabricante_cnpj: string;
  fabricante_razao: string;
  fabricante_fantasia: string;
  fabricante_divisao: string;
  fabricante_holding: string;
  farmacologico_descricao: string;
  principio_ativo: string;
  concentracao: string;
  unidade_medida: string;
  unidade_medida_abrev: string;
  uso_continuo: string;
  receita_validade: string;
  receita_cor: string;
  pbm_programa: string;
  pbm_provedor: string;
  pbm_perc_desconto: string;
  cadastro_associado_id: string;
  descricao_tipo_enviado: string;
  produto_id_transferido: string;
  preco_dt_alteracao: string;
  preco_controlado: string;
  preco_controlado_dt_alteracao: string;
  cod_ms: string;
  lista: string;
  fracao: string;
  portaria: string;
  gs1_status: string;
  gs1_dt_envio: string;
  dt_cadastro: string;
  dt_inativacao: string;
  dt_ultimo_movimento: string;
  status_cadastro: string;
  situacao_cadastro: string;
  dt_alteracao: string;
  dt_atualizacao: string;
  flag_produto_pbm: string;
  departamento: string;
};
