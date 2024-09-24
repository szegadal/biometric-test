import { useState, useEffect, useLayoutEffect } from 'react'
import { Amplify } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import output from '../amplify_outputs.json'
import 'react-responsive-modal/styles.css'
import { Modal } from 'react-responsive-modal'
import { startBiometricSession, getSessionResults } from './services/metabet'
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness'
import {
  ThemeProvider,
  // Authenticator,
  Card,
  View,
  Heading,
  Flex,
  useTheme,
  Button,
  Alert,
  // SliderField,
  // Image
} from '@aws-amplify/ui-react'
Amplify.configure(output)

export function Liveness() {
  const { tokens } = useTheme()
  const theme = {
    name: 'Face Liveness Example Theme',
    tokens: {
      colors: {
        background: {
          primary: {
            value: tokens.colors.neutral['90'].value
          },
          secondary: {
            value: tokens.colors.neutral['100'].value
          }
        },
        font: {
          primary: {
            value: tokens.colors.white.value
          }
        },
        brand: {
          primary: {
            10: tokens.colors.teal['100'],
            80: tokens.colors.teal['40'],
            90: tokens.colors.teal['20'],
            100: tokens.colors.teal['10']
          }
        }
      }
    }
  }
  const urlParams = new URLSearchParams(window.location.search)
  const userId = urlParams.get('userId')
  const [sessionId, setSessionID] = useState(null)
  const [userSelectedConfidence, setuserSelectedConfidence] = useState(80)
  const [open, setOpen] = useState(true)
  const [geoLocation, setGeoLocation] = useState({ latitude: null, longitude: null })

  const closeModal = () => setOpen(false)

  const getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setGeoLocation({ latitude, longitude })
        },
        (error) => {
          console.error('Error obteniendo la geolocalización:', error)
        }
      )
    } else {
      console.error('La geolocalización no es compatible con este navegador.')
    }
  }


  const handleStartLiveness = () => {
    const fetchCreateLiveness = async () => {
      try {
        const newSessionData = {
          user: { userId, provider: 'awsAmplify' },
          latitude: geoLocation.latitude,
          longitude: geoLocation.longitude
        }
        console.log(newSessionData)
        const data = await startBiometricSession(newSessionData)
        setSessionID(data.SessionId)
      } catch (error) {
        console.log(error)
      }
    }
    if (geoLocation.latitude && geoLocation.longitude) {
      fetchCreateLiveness()
    } else {
      console.log('Esperando por la geolocalización...')
    }
  }

  // const setSliderValue = (value) => {
  //   localStorage.setItem('userSelectedConfidence', value)
  //   setuserSelectedConfidence(value)
  // }

  // const formatValue = (value) => {
  //   localStorage.setItem('userSelectedConfidence', value)
  //   return `${value}`
  // }

  const onUserCancel = () => {
    setSessionID(null)
    handleStartLiveness()
  }

  useLayoutEffect(() => {
    setuserSelectedConfidence(userSelectedConfidence)
    getGeolocation()
  }, [userSelectedConfidence])

  const handleConsent = () => {
    setOpen(false)
    localStorage.setItem('userConsent', true)
    handleStartLiveness()
  }

  const handleGetLivenessDetection = async (sessionId) => {
    if (sessionId) {
      const data = await getSessionResults(sessionId)
      try {
        const confidence = data.Confidence
        setuserSelectedConfidence(localStorage.getItem('userSelectedConfidence'))
        if (confidence >= userSelectedConfidence) {
          alert(`Its Alive!! Confidence: ${confidence}`)
        } else {
          alert(`Its Dead!! Confidence: ${confidence}`)
        }
      } catch (err) {
        console.log(err)
        return { isLive: false }
      }
    }
  }

  useEffect(() => {
    // console.log('geoLocation: ', geoLocation)
    // handleStartLiveness()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      {/* <Authenticator> */}
      {open ? (
        <View direction={{ base: 'column', large: 'row' }}>
          <Modal open={open} showCloseIcon={false}>
            <Alert
              isDismissible={false}
              onDismiss={() => closeModal()}
              hasIcon={true}
              direction={{ base: 'column', large: 'row' }}
            >
              <Heading level={6} marginBottom={tokens.space.small} fontWeight={tokens.fontWeights.light}>
                This feature uses Amazon Web Services. Amazon Web Services may collect, store, and use biometric
                identifiers and biometric information (`&quot;`biometric data`&quot;`) to compare an individual`&apos;`s image with a stored
                image for analysis, verification, fraud, and security purposes.
              </Heading>{' '}
              <Heading level={6} marginBottom={tokens.space.large} fontWeight={tokens.fontWeights.light}>
                Amazon Web Services’ privacy policy will retain generated biometric information from this process. You
                provide your express, informed, written release and consent for Amazon Web Services to collect, use, and
                store your biometric data as described herein.
              </Heading>
              <Flex
                direction="row"
                justifyContent="center"
                alignItems="center"
                alignContent="center"
                wrap="nowrap"
                gap="1rem"
              >
                {' '}
                <Button variation="primary" onClick={handleConsent}>
                  Ok
                </Button>{' '}
              </Flex>
            </Alert>
          </Modal>
        </View>
      ) : (
        <>
          {sessionId ? (
            <>
              {/* <Alert variation="info" isDismissible={true} hasIcon={true}>
                <Heading level={6}>Liveness Session ID: {sessionId}</Heading>
              </Alert>
              <Flex
                direction="row"
                justifyContent="center"
                alignItems="center"
                alignContent="center"
                wrap="nowrap"
                gap="2rem"
              >
                <SliderField
                  marginTop={tokens.space.large}
                  label="Set liveness score:"
                  defaultValue={userSelectedConfidence}
                  onChange={setSliderValue}
                  formatValue={formatValue}
                />
              </Flex> */}
              <Card>
                <Flex
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  alignContent="center"
                  wrap="nowrap"
                  gap="1rem"
                >
                  <View as="div" width="740px" maxWidth="740px" overflow="auto">
                    <FaceLivenessDetector
                      sessionId={sessionId}
                      region="us-east-1"
                      onUserCancel={onUserCancel}
                      onAnalysisComplete={async () => {
                        const response = await handleGetLivenessDetection(sessionId)
                        console.log('response: ', response)
                      }}
                      onError={async (error) => {
                        console.log(error)
                      }}
                    />
                  </View>
                </Flex>
              </Card>
            </>
          ) : (
            <Button isLoading={true} loadingText="Loading..." variation="primary"></Button>
          )}
        </>
      )}
      {/* </Authenticator> */}
    </ThemeProvider>
  )
}

export default Liveness
