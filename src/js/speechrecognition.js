import { ref, onMounted } from "vue";
import { writeToDatabase } from "../api/api";
/*import { SpeechRecognition } from "@capacitor-community/speech-recognition";

async function enableSpeechRecognition() {
  const available = await SpeechRecognition.available();
  if (available) {
    // Configure and start recognition
    SpeechRecognition.start({
      language: "en-US",
      maxResults: 1,
      prompt: "Speak now!",
    });
  } else {
    console.error("Speech recognition not available");
  }
}*/

export function useSpeechRecognition(config, commands) {
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const sr = new Recognition();

  const transcript = ref("");
  const spielzug = ref("");
  const spieler = ref("");
  const yards = ref("");
  const sonstiges = ref("");
  const nextInput = ref("spielzug");
  const isRecording = ref(false);
  const needsYards = ref(false);

  sr.onerror = function (event) {
    console.error("Speech recognition error: " + event.error);
    switch (event.error) {
      case "network":
        alert("Network error - please check your internet connection.");
        break;
      case "no-speech":
        alert("No speech was detected. Please try again.");
        break;
      case "not-allowed":
        alert(
          "The speech recognition permission was denied. Please allow access to the microphone."
        );
        break;
      case "service-not-allowed":
        alert(
          "Speech recognition service is not allowed. Please check if your browser supports it."
        );
        break;
      default:
        alert("An error occurred in speech recognition: " + event.error);
    }
  };

  onMounted(() => {
    sr.continuous = true;
    sr.interimResults = true;
    sr.lang = "de-DE";
    sr.onresult = handleResult;
    sr.onstart = () => (isRecording.value = true);
    sr.onend = () => (isRecording.value = false);
  });

  const handleResult = (evt) => {
    let tempTranscript = "";
    for (let i = 0; i < evt.results.length; i++) {
      const result = evt.results[i];
      const transcript = result[0].transcript.trim();

      if (result.isFinal) {
        tempTranscript += transcript + " ";
        parseTranscript(transcript);
      }
    }
    transcript.value = tempTranscript;
  };

  const parseTranscript = (transcript) => {
    const lowerTrans = transcript.toLowerCase();
    console.log(lowerTrans);

    // Identify Spielzug (event)
    if (nextInput.value == "spielzug") {
      sr.lang = "en-US";
      config.spielzüge.forEach((spielzugItem) => {
        // console.log(spielzugItem);
        if (lowerTrans.includes(spielzugItem)) {
          spielzug.value = spielzugItem;
          needsYards.value = [
            "pass",
            "run",
            "first down",
            "touchdown",
            "interception",
            "strafe",
          ].includes(spielzugItem);
          nextInput.value = "spieler";
          commands.value = "Spielername oder Trikotnummer?";
          restartMic();
          sr.lang = "de-DE";
        }
      });
    }

    // Identify Spieler (player)
    if (nextInput.value == "spieler") {
      config.players.forEach((player) => {
        // console.log(player);
        if (lowerTrans.includes(player)) {
          spieler.value = player;
          nextInput.value = "sonstiges";
          commands.value = "Strafen oder Bestätigen?";
          if (needsYards.value) {
            nextInput.value = "yards";
            commands.value = "Wie viele Yards?";
          }
          restartMic();
        }
        const numberMatch = lowerTrans.match(/\d/);
        if (numberMatch) {
          console.log(numberMatch);
          spieler.value = parseInt(numberMatch[0]);
          nextInput.value = "sonstiges";
          commands.value = "Strafen oder Bestätigen?";
          if (needsYards.value) {
            nextInput.value = "yards";
            commands.value = "Wie viele Yards?";
          }
          restartMic();
        }
      });
    }

    // Extract Yards
    if (nextInput.value == "yards") {
      const yardsMatch = lowerTrans.match(/\d+ (yards|yard)/);
      if (yardsMatch) {
        yards.value = parseInt(yardsMatch[0]);
        nextInput.value = "sonstiges";
        commands.value = "Strafen oder Bestätigen?";
        restartMic();
      }
    }

    if (nextInput.value == "sonstiges") {
      if (lowerTrans.includes("strafe")) {
        nextInput.value = "strafe";
        commands.value = "Welche Strafe?";
        restartMic();
      }
      if (lowerTrans.includes("bestätigen")) {
        confirmInputs();
      }
    }

    if (nextInput.value == "strafe") {
      config.strafen.forEach((strafe) => {
        // console.log(strafe);
        if (lowerTrans.includes(strafe)) {
          sonstiges.value += strafe;
          nextInput.value = "spieler oder team";
          commands.value = "Gegner oder welcher unserer Spielenden?";
          restartMic();
        }
      });
    }

    if (nextInput.value == "spieler oder team") {
      if (lowerTrans.includes("gegner")) {
        nextInput.value = "sonstiges";
        commands.value = "Weitere Strafen oder Bestätigen?";
        return;
      }
      config.players.forEach((player) => {
        // console.log(player);
        if (lowerTrans.includes(player)) {
          sonstiges.value += " " + player + ";";
          nextInput.value = "sonstiges";
          commands.value = "Weitere Strafen oder Bestätigen?";
          restartMic();
        }
        const numberMatch = lowerTrans.match(/\d/);
        if (numberMatch) {
          console.log(numberMatch);
          spieler.value = parseInt(numberMatch[0]);
          nextInput.value = "sonstiges";
          commands.value = "Strafen oder Ähnliches?";
          restartMic();
        }
      });
    }
  };

  const confirmInputs = () => {
    writeToDatabase(
      spielzug.value,
      spieler.value,
      yards.value,
      sonstiges.value
    );
    resetInputs();
  };

  const resetInputs = () => {
    sr.stop();
    spielzug.value = "";
    spieler.value = "";
    yards.value = "";
    sonstiges.value = "";
  };

  const restartMic = () => {
    stop();
    sr.onend = () => {
      start();
    };
  };

  const start = () => {
    try {
      isRecording.value = true;
      sr.start();
    } catch (error) {
      console.error("Speechrecognition error:", error);
    }
  };
  const stop = () => {
    isRecording.value = false;
    sr.stop();
  };

  return {
    transcript,
    isRecording,
    start,
    stop,
    spielzug,
    spieler,
    yards,
    sonstiges,
  };
}
