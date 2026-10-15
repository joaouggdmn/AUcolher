// Página "Meus animais" (só pessoa física): as duas abas e o republicar
export const MY_ANIMALS_PATH = '/meus-animais'
export const MY_ANIMALS_ADOPTED_PATH = `${MY_ANIMALS_PATH}?aba=adotados`
export const rehomePath = (requestId) => `${MY_ANIMALS_PATH}/republicar/${requestId}`
