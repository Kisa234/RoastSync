export interface ICoffeeFlavor {
  name: String;
  color: String;
  children?: ICoffeeFlavor[];
}

export const CoffeeFlavors: ICoffeeFlavor[] = [
  {
    "name": "tostado",
    "color": "#d33727",
    "children": [
      { "name": "tabaco de pipa", "color": "#a49663" },
      { "name": "tabaco", "color": "#cfb480" },
      {
        "name": "quemado",
        "color": "#b6804d",
        "children": [
          { "name": "acre", "color": "#b0a068" },
          { "name": "ceniciento", "color": "#94a993" },
          { "name": "ahumado", "color": "#a97f34" },
          { "name": "marrón tostado", "color": "#835621" }
        ]
      },
      {
        "name": "cereal",
        "color": "#e4bd2d",
        "children": [
          { "name": "grano", "color": "#d0a588" },
          { "name": "malta", "color": "#ec9b65" }
        ]
      }
    ]
  },
  {
    "name": "especias",
    "color": "#b90d41",
    "children": [
      { "name": "pungente", "color": "#734864" },
      { "name": "pimienta", "color": "#bc4747" },
      {
        "name": "especias cálidas",
        "color": "#be404c",
        "children": [
          { "name": "anís", "color": "#c99f19" },
          { "name": "nuez moscada", "color": "#a61619" },
          { "name": "canela", "color": "#e6922f" },
          { "name": "clavo", "color": "#b5796e" }
        ]
      }
    ]
  },
  {
    "name": "nueces/cacao",
    "color": "#9a7b79",
    "children": [
      {
        "name": "nueces",
        "color": "#b59287",
        "children": [
          { "name": "cacahuetes", "color": "#e4b509" },
          { "name": "avellana", "color": "#935f21" },
          { "name": "almendra", "color": "#d9a99c" }
        ]
      },
      {
        "name": "cacao",
        "color": "#b37122",
        "children": [
          { "name": "chocolate", "color": "#6b271f" },
          { "name": "chocolate negro", "color": "#4a271d" }
        ]
      }
    ]
  },
  {
    "name": "dulce",
    "color": "#f36421",
    "children": [
      {
        "name": "azúcar moreno",
        "color": "#ce7c92",
        "children": [
          { "name": "melaza", "color": "#230007" },
          { "name": "jarabe de arce", "color": "#d85e25" },
          { "name": "caramelizado", "color": "#e2a227" },
          { "name": "miel", "color": "#f47e2a" }
        ]
      },
      { "name": "vainilla", "color": "#f6997d" },
      { "name": "vanilina", "color": "#f38088" },
      { "name": "dulzura general", "color": "#de707a" },
      { "name": "aromas dulces", "color": "#ce3e6c" }
    ]
  },
  {
    "name": "floral",
    "color": "#ec008c",
    "children": [
      { "name": "té negro", "color": "#ae667d" },
      {
        "name": "floral",
        "color": "#f05794",
        "children": [
          { "name": "manzanilla", "color": "#fbaf25" },
          { "name": "rosa", "color": "#e472a7" },
          { "name": "jazmín", "color": "#f8f7e5" }
        ]
      }
    ]
  },
  {
    "name": "frutal",
    "color": "#ee1d23",
    "children": [
      {
        "name": "bayas",
        "color": "#ed2c4b",
        "children": [
          { "name": "mora", "color": "#090819" },
          { "name": "frambuesa", "color": "#e32487" },
          { "name": "arándano", "color": "#666aac" },
          { "name": "fresa", "color": "#ee293b" }
        ]
      },
      {
        "name": "fruta seca",
        "color": "#d7444f",
        "children": [
          { "name": "pasa", "color": "#9e1e79" },
          { "name": "ciruela pasa", "color": "#85558f" }
        ]
      },
      {
        "name": "otras frutas",
        "color": "#f26648",
        "children": [
          { "name": "coco", "color": "#e48e2a" },
          { "name": "cereza", "color": "#e71158" },
          { "name": "granada", "color": "#ef4b60" },
          { "name": "piña", "color": "#f89d1c" },
          { "name": "uva", "color": "#9ec536" },
          { "name": "manzana", "color": "#69c071" },
          { "name": "durazno", "color": "#f37f51" },
          { "name": "pera", "color": "#b2aa1e" }
        ]
      },
      {
        "name": "cítricos",
        "color": "#fcb914",
        "children": [
          { "name": "pomelo", "color": "#f05a5e" },
          { "name": "naranja", "color": "#f47921" },
          { "name": "limón", "color": "#f5da02" },
          { "name": "lima", "color": "#91c355" }
        ]
      }
    ]
  },
  {
    "name": "agrio/fermentado",
    "color": "#f5ce02",
    "children": [
      {
        "name": "agrio",
        "color": "#e2d925",
        "children": [
          { "name": "aromas agrios", "color": "#c0bd1e" },
          { "name": "ácido acético", "color": "#9fc78a" },
          { "name": "ácido butírico", "color": "#d6c509" },
          { "name": "ácido isovalérico", "color": "#71c05a" },
          { "name": "ácido cítrico", "color": "#e4d711" },
          { "name": "ácido málico", "color": "#b4c425" }
        ]
      },
      {
        "name": "alcohol/fermentado",
        "color": "#b2a113",
        "children": [
          { "name": "vinoso", "color": "#a50a71" },
          { "name": "whisky", "color": "#b03a53" },
          { "name": "fermentado", "color": "#d2a808" },
          { "name": "sobremaduro", "color": "#7e7029" }
        ]
      }
    ]
  },
  {
    "name": "vegetal/verde",
    "color": "#17803b",
    "children": [
      { "name": "aceite de oliva", "color": "#a0b127" },
      { "name": "crudo", "color": "#6c8c39" },
      {
        "name": "vegetal verde",
        "color": "#21b252",
        "children": [
          { "name": "poco maduro", "color": "#aaca47" },
          { "name": "vaina de guisante", "color": "#47b44a" },
          { "name": "fresco", "color": "#00ab6f" },
          { "name": "verde oscuro", "color": "#00603d" },
          { "name": "vegetal", "color": "#1eb26a" },
          { "name": "a heno", "color": "#9fa122" },
          { "name": "herbáceo", "color": "#79c359" }
        ]
      },
      { "name": "leguminoso", "color": "#6f9f95" }
    ]
  },
  {
    "name": "otro",
    "color": "#00a7d2",
    "children": [
      {
        "name": "químico",
        "color": "#61c6dd",
        "children": [
          { "name": "amargo", "color": "#6fc9bf" },
          { "name": "salado", "color": "#ced2ca" },
          { "name": "medicinal", "color": "#61a8c4" },
          { "name": "petróleo", "color": "#00a9c1" },
          { "name": "olor a mofeta", "color": "#5c8296" },
          { "name": "caucho", "color": "#001631" }
        ]
      },
      {
        "name": "papeloso/mohoso",
        "color": "#9bbccc",
        "children": [
          { "name": "rancio", "color": "#657d6b" },
          { "name": "cartón", "color": "#dac346" },
          { "name": "a papel", "color": "#ffffff" },
          { "name": "amaderado", "color": "#725c26" },
          { "name": "mohoso/húmedo", "color": "#a1ac74" },
          { "name": "mohoso/polvoriento", "color": "#caa669" },
          { "name": "mohoso/terroso", "color": "#948547" },
          { "name": "animal", "color": "#a0a277" },
          { "name": "caldo cárnico", "color": "#cb817a" },
          { "name": "fenólico", "color": "#e97e89" }
        ]
      }
    ]
  }
]

