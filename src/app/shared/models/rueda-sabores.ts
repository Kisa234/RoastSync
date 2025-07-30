export interface ICoffeeFlavor {
  name: string;
  color: string;
  children?: ICoffeeFlavor[];
}

export const CoffeeFlavors: ICoffeeFlavor[] = [
  {
    name: 'floral',
    color: '#da0d68',
    children: [
      { name: 'té negro', color: '#975e6d' },
      {
        name: 'floral',
        color: '#e0719c',
        children: [
          { name: 'manzanilla', color: '#f99e1c' },
          { name: 'rosa', color: '#ef5a78' },
          { name: 'jazmín', color: '#f7f1bd' },
        ],
      },
    ],
  },
  {
    name: 'frutal',
    color: '#da1d23',
    children: [
      {
        name: 'bayas',
        color: '#dd4c51',
        children: [
          { name: 'mora', color: '#3e0317' },
          { name: 'frambuesa', color: '#e62969' },
          { name: 'arándano', color: '#6569b0' },
          { name: 'fresa', color: '#ef2d36' },
        ],
      },
      {
        name: 'fruta seca',
        color: '#c94a44',
        children: [
          { name: 'pasa', color: '#b53b54' },
          { name: 'ciruela pasa', color: '#a5446f' },
        ],
      },
      {
        name: 'otras frutas',
        color: '#dd4c51',
        children: [
          { name: 'coco', color: '#f2684b' },
          { name: 'cereza', color: '#e73451' },
          { name: 'granada', color: '#e65656' },
          { name: 'piña', color: '#f89a1c' },
          { name: 'uva', color: '#aeb92c' },
          { name: 'manzana', color: '#4eb849' },
          { name: 'durazno', color: '#f68a5c' },
          { name: 'pera', color: '#baa635' },
        ],
      },
      {
        name: 'cítricos',
        color: '#f7a128',
        children: [
          { name: 'pomelo', color: '#f26355' },
          { name: 'naranja', color: '#e2631e' },
          { name: 'limón', color: '#fde404' },
          { name: 'lima', color: '#7eb138' },
        ],
      },
    ],
  },
  {
    name: 'agrio/fermentado',
    color: '#ebb40f',
    children: [
      {
        name: 'agrio',
        color: '#e1c315',
        children: [
          { name: 'aromas agrios', color: '#9ea718' },
          { name: 'ácido acético', color: '#94a76f' },
          { name: 'ácido butírico', color: '#d0b24f' },
          { name: 'ácido isovalérico', color: '#8eb646' },
          { name: 'ácido cítrico', color: '#faef07' },
          { name: 'ácido málico', color: '#c1ba07' },
        ],
      },
      {
        name: 'alcohol/fermentado',
        color: '#b09733',
        children: [
          { name: 'vinoso', color: '#8f1c53' },
          { name: 'whisky', color: '#b34039' },
          { name: 'fermentado', color: '#ba9232' },
          { name: 'sobremaduro', color: '#8b6439' },
        ],
      },
    ],
  },
  {
    name: 'vegetal/verde',
    color: '#187a2f',
    children: [
      { name: 'aceite de oliva', color: '#a2b029' },
      { name: 'crudo', color: '#718933' },
      {
        name: 'vegetal verde',
        color: '#3aa255',
        children: [
          { name: 'poco maduro', color: '#a2bb2b' },
          { name: 'vaina de guisante', color: '#62aa3c' },
          { name: 'fresco', color: '#03a653' },
          { name: 'verde oscuro', color: '#038549' },
          { name: 'vegetal', color: '#28b44b' },
          { name: 'a heno', color: '#a3a830' },
          { name: 'herbáceo', color: '#7ac141' },
        ],
      },
      { name: 'leguminoso', color: '#5e9a80' },
    ],
  },
  {
    name: 'otro',
    color: '#0aa3b5',
    children: [
      {
        name: 'papeloso/mohoso',
        color: '#9db2b7',
        children: [
          { name: 'rancio', color: '#8b8c90' },
          { name: 'cartón', color: '#beb276' },
          { name: 'a papel', color: '#fefef4' },
          { name: 'amaderado', color: '#744e03' },
          { name: 'mohoso/húmedo', color: '#a3a36f' },
          { name: 'mohoso/polvoriento', color: '#c9b583' },
          { name: 'mohoso/terroso', color: '#978847' },
          { name: 'animal', color: '#9d977f' },
          { name: 'caldo cárnico', color: '#cc7b6a' },
          { name: 'fenólico', color: '#db646a' },
        ],
      },
      {
        name: 'químico',
        color: '#76c0cb',
        children: [
          { name: 'amargo', color: '#80a89d' },
          { name: 'salado', color: '#def2fd' },
          { name: 'medicinal', color: '#7a9bae' },
          { name: 'petróleo', color: '#039fb8' },
          { name: 'olor a mofeta', color: '#5e777b' },
          { name: 'caucho', color: '#120c0c' },
        ],
      },
    ],
  },
  {
    name: 'tostado',
    color: '#c94930',
    children: [
      { name: 'tabaco de pipa', color: '#caa465' },
      { name: 'tabaco', color: '#dfbd7e' },
      {
        name: 'quemado',
        color: '#be8663',
        children: [
          { name: 'acre', color: '#b9a449' },
          { name: 'ceniza', color: '#899893' },
          { name: 'ahumado', color: '#a1743b' },
          { name: 'marrón tostado', color: '#894810' },
        ],
      },
      {
        name: 'cereal',
        color: '#ddaf61',
        children: [
          { name: 'grano', color: '#b7906f' },
          { name: 'malta', color: '#eb9d5f' },
        ],
      },
    ],
  },
  {
    name: 'especias',
    color: '#ad213e',
    children: [
      { name: 'pungente', color: '#794752' },
      { name: 'pimienta', color: '#cc3d41' },
      {
        name: 'especias cálidas',
        color: '#b14d57',
        children: [
          { name: 'anís', color: '#c78936' },
          { name: 'nuez moscada', color: '#8c292c' },
          { name: 'canela', color: '#e5762e' },
          { name: 'clavo', color: '#a16c5a' },
        ],
      },
    ],
  },
  {
    name: 'nueces/cacao',
    color: '#a87b64',
    children: [
      {
        name: 'nueces',
        color: '#c78869',
        children: [
          { name: 'cacahuetes', color: '#d4ad12' },
          { name: 'avellana', color: '#9d5433' },
          { name: 'almendra', color: '#c89f83' },
        ],
      },
      {
        name: 'cacao',
        color: '#bb764c',
        children: [
          { name: 'chocolate', color: '#692a19' },
          { name: 'chocolate negro', color: '#470604' },
        ],
      },
    ],
  },
  {
    name: 'dulce',
    color: '#e65832',
    children: [
      {
        name: 'azúcar moreno',
        color: '#d45a59',
        children: [
          { name: 'melaza', color: '#310d0f' },
          { name: 'jarabe de arce', color: '#ae341f' },
          { name: 'caramelizado', color: '#d78823' },
          { name: 'miel', color: '#da5c1f' },
        ],
      },
      { name: 'vainilla', color: '#f89a80' },
      { name: 'vanilina', color: '#f37674' },
      { name: 'dulzura general', color: '#e75b68' },
      { name: 'aromas dulces', color: '#d0545f' },
    ],
  },
];
