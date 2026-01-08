/**
 * Extrait et formate les erreurs d'une réponse API
 * @param {Object} error - L'objet erreur axios
 * @param {string} defaultMessage - Message par défaut si aucune erreur n'est trouvée
 * @returns {Array} - Tableau de messages d'erreur
 */
export const extractErrors = (error, defaultMessage = 'Une erreur est survenue') => {
  if (error.response && error.response.data) {
    const data = error.response.data

    // Cas 1: errors est un tableau
    if (Array.isArray(data.errors)) {
      return data.errors
    }
    
    // Cas 2: errors est un objet (validation Laravel par exemple)
    if (typeof data.errors === 'object' && data.errors !== null) {
      return Object.values(data.errors).flat()
    }
    
    // Cas 3: message simple
    if (data.message) {
      return [data.message]
    }
  }
  
  // Cas par défaut
  return [defaultMessage]
}
