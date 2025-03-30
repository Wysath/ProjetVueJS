export const BASE_URL = 'http://127.0.0.1:8000'

// Fonction pour récupérer l'email d'un utilisateur par son ID
export const getUserEmail = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/users/${userId}`)
  const data = await response.json() // Assurez-vous que la réponse est convertie en JSON
  return data.email // Retourne l'email ou la valeur que tu souhaites afficher
}

// Fonction pour récupérer l'UUID de l'utilisateur depuis localStorage
export const getUserUuid = () => {
  return sessionStorage.getItem('userUuid') // Récupère l'UUID stocké dans le localStorage
}

export async function uploadFile(file, progressCallback = null) {
  const token = sessionStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    if (progressCallback && typeof progressCallback === 'function') {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          progressCallback(percentComplete)
        }
      })
    }

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch (e) {
          reject(new Error('Erreur lors du parsing de la réponse'))
        }
      } else {
        reject(new Error(`Erreur lors de l'upload: ${xhr.status}`))
      }
    }

    xhr.onerror = function () {
      reject(new Error("Erreur réseau lors de l'upload"))
    }

    xhr.open('POST', `${BASE_URL}/api/upload`, true)

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.send(formData)
  })
}

// Fonction de requête API générale
export async function api(url, params = {}, requiresAuth = true) {
  const token = sessionStorage.getItem('token')
  params = Object.assign(
    {
      mode: 'cors',
      cache: 'no-cache',
    },
    params,
  )

  if (requiresAuth && token) {
    console.log('Token being sent:', token)
    params.headers = Object.assign(
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params.headers,
    )
  } else {
    params.headers = Object.assign(
      {
        'Content-Type': 'application/json',
      },
      params.headers,
    )
  }

  console.log('Request headers:', params.headers)

  try {
    let response = await fetch(BASE_URL + url, params)
    let json = (await response.json()) || {}
    if (!response.ok) {
      let errorMessage = json.error || response.status
      throw new Error(errorMessage)
    }

    return json
  } catch (error) {
    console.error('API error:', error)
    throw error
  }
}
