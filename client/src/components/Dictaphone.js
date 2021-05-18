import React, {useState, useEffect} from 'react'
import UseVoice from '../UseVoice'
import { Container } from 'semantic-ui-react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const Dictaphone = ({
    createChartWithVoice,
    setOverHearingData
  }) => {
  
    const [listening, setListening] = useState(false)
  
    let commands = [
      {
        command: "computer *",
        callback: (command) => {
          console.log('listening')
          let utterance = createChartWithVoice(command, transcript)
          utterance.onend = function (event) {
            console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
            setListening(true)
          }
        }
      },
      {
        command: "computer",
        callback: () => {
          let utterance = UseVoice("At your service")
          utterance.onend = function (event) {
  
            console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
            setTimeout(() => {
              setListening(true)
              console.log('listening')
            }, 2500)
  
  
          }
        }
      },
      {
        command: "computer are you there?",
        callback: () => {
          let utterance = UseVoice("Yes, how can i help you?")
          utterance.onend = function (event) {
            console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
            setListening(true)
          }
        }
      }
    ]
  
  
  
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
  
    // if(listening) {
    //   // console.log('listening')
    //   commands = [
    //     {
    //       command: "*",
    //       callback: (command) => {
    //         let commandUtterance = createChartWithVoice(command)
    //         console.log(command)
    //         setListening(true)
    //         commandUtterance.onend = function(event) {
    //           console.log('Utterance has finished being spoken after ' + event.elapsedTime + ' milliseconds.');
    //         }
    //       }
    //     }
    //   ]
    // }
  
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
        {/* <button onClick={SpeechRecognition.startListening}>Start</button>
        <button onClick={() => {
          SpeechRecognition.stopListening();
          createChartWithVoice(transcript);
        }}>Create Visualization</button> */}
        <Container>
          <p>{transcript}</p>
        </Container>
      </div>
    )
  }

export default Dictaphone