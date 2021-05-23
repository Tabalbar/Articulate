import UseVoice from './UseVoice'
export async function serverRequests(command, attributes, dataHead, prevChart, overHearingData,
    synonymAttributes, featureAttributes, randomChart, setErrMsg,
    setCurrentHeaderFreq, setPrevChart, setCharts, setPlotlyCharts, noCharts, charts) {


    const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        body: JSON.stringify(
            {
                command: command,
                attributes: attributes,
                dataHead: dataHead,
                prevChart: prevChart,
                overHearingData: overHearingData,
                synonymAttributes: synonymAttributes,
                featureAttributes: featureAttributes,
                randomChart: randomChart,
                currentCharts: charts
            }),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const body = await response.text();
    setErrMsg("")
    const { chartObj, headerFreq } = JSON.parse(body)
    setCurrentHeaderFreq(headerFreq)
    let numChartReturned = 0;
    let tmpText = ""
    setPrevChart(chartObj)

    for (let i = 0; i < chartObj.length; i++) {
        if (chartObj[i].errMsg === '' && chartObj[i].charts !== null) {
            console.log(chartObj[i].errMsg)
            setCharts(prev => [chartObj[i].charts, ...prev])
            numChartReturned++
        } else if (chartObj[i].plotly && chartObj[i].errMsg === '') {
            setPlotlyCharts(prev => [chartObj[i], ...prev])
            numChartReturned++
        } else {
            setErrMsg(prev => prev + chartObj[i].errMsg + "\n")
            tmpText += chartObj[i].errMsg
        }

    }
    if (chartObj.length == 0) {
        tmpText = noCharts[Math.floor(Math.random() * 3)]
        setErrMsg(tmpText)
    } else {
        setErrMsg(prev => prev + "Returned " + numChartReturned + " charts")
        tmpText += "Returned " + numChartReturned + " chart(s)"
    }

    let utterance = UseVoice(tmpText)
    return utterance
}