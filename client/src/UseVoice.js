function UseVoice(text) {
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.voice = voices[49]; 
    msg.volume = 1; // From 0 to 1
    msg.rate = 1; // From 0.1 to 10
    msg.pitch = 0; // From 0 to 2
    msg.lang = 'en';
    msg.text = text
    window.speechSynthesis.speak(msg);
}

export default UseVoice