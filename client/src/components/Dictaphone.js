import React, { useState, useEffect } from 'react'
import UseVoice from '../UseVoice'
import { Container } from 'semantic-ui-react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const Dictaphone = ({
  createChartWithVoice,
  setOverHearingData
}) => {

  const [listening, setListening] = useState(false)
  const [tmpTranscript, setTmpTranscript] = useState("")
  const [newTranscript, setNewTranscript] = useState("")
  let commands = [
    {
      command: "*",
      callback: (message) => {
        setTmpTranscript(message)
        // let utterance = createChartWithVoice(command)
        // utterance.onend = function (event) {
        //   console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
        //   setListening(true)
        // }
      }
    }
    // {
    //   command: "computer",
    //   callback: () => {
    //     let utterance = UseVoice("At your service")
    //     utterance.onend = function (event) {

    //       console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
    //       setTimeout(() => {
    //         setListening(true)
    //         console.log('listening')
    //       }, 4000)


    //     }
    //   }
    // },
    // {
    //   command: "computer are you there?",
    //   callback: () => {
    //     let utterance = UseVoice("Yes, how can i help you?")
    //     utterance.onend = function (event) {
    //       console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
    //       setListening(true)
    //     }
    //   }
    // }
  ]
  useEffect(() => {
    if (tmpTranscript == "") {
      return
    }
    setNewTranscript(prev => { return (prev + tmpTranscript + ". ") })
    if(tmpTranscript.includes("show")) {
      createChartWithVoice(tmpTranscript)
    }

  }, [tmpTranscript])

  useEffect(() => {
    if (listening) {
      const timer = setTimeout(() => {
        setListening(false)
        console.log('not listening')
      }, 10000)
      return () => {
        clearTimeout(timer)
      }
    }

  }, [listening])

  const { transcript, resetTranscript } = useSpeechRecognition({ commands })

  useEffect(() => {
    setOverHearingData(transcript)
  }, [transcript])

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null
  } else {
    SpeechRecognition.startListening({ continuous: true })

  }

  return (
    <div>
      <Container>
        <p>{transcript}</p>
      </Container>
    </div>
  )
}

export default Dictaphone