// const urlBase = 'https://system.cpelsac.com/api/v1'
// const urlBase = 'http://localhost:3002/api/v1'
const urlBase = 'https://401n8gz0-3002.brs.devtunnels.ms/api/v1'
// const urlBase = 'https://st5v6tkh-3001.brs.devtunnels.ms/api/v1'

export async function startBiometricSession(requestData) {

  const res = await fetch(`${urlBase}/users/biometric-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData),
    mode: 'cors'
  })
  const data = await res.json()
  console.log(data)
  return data
}

export async function getSessionResults(sessionId) {
  const res = await fetch(`${urlBase}/users/biometric-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId
    }),
    mode: 'cors'
  })
  const data = await res.json()
  console.log(data)
  return data
}
