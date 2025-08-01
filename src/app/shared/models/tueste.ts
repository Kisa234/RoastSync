export interface Tueste {
   id_tueste                 :string,
   num_batch                 :number,
   id_lote                   :string,
   tostadora                 :string,
   id_pedido                 :string,
   densidad                  :number,
   humedad                   :number,
   peso_entrada              :number,
   fecha_tueste              :Date,
   estado_tueste             :string,
   temperatura_entrada       :number,
   llama_inicial             :number,
   aire_inicial              :number,
   punto_no_retorno          :number,
   tiempo_despues_crack      :number,
   temperatura_crack         :number,
   temperatura_salida        :number,
   tiempo_total              :number,
   porcentaje_caramelizacion :number,
   desarrollo                :number,
   grados_desarrollo         :number,
   peso_salida               :number,
   merma                     :number,
   agtrom_comercial          :number,
   agtrom_gourmet            :number,
   id_analisis_rapido        :number,
   id_lote_tostado           :number,
   eliminado                 :number,   
}
