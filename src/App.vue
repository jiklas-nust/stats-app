<script setup>
import { ref, onMounted } from "vue";
import config from "./assets/config.json";
import { writeToDatabase } from "./api/api";

const transcript = ref("");
const commands = ref("");
const spielzug = ref("");
const spieler = ref("");
const yards = ref("");
const sonstiges = ref("");
const isRecording = ref(false);
const needsYards = ref(false);

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const sr = new Recognition();

onMounted(() => {
  sr.continuous = true;
  sr.interimResults = true;

  // Set language to German
  sr.lang = "de-DE";

  commands.value = config.spielzüge;

  sr.onstart = () => {
    console.log("SR Started");
    isRecording.value = true;
  };

  sr.onend = () => {
    console.log("SR Stopped");
    isRecording.value = false;
  };

  sr.onresult = (evt) => {
    for (let i = 0; i < evt.results.length; i++) {
      const result = evt.results[i];

      if (result.isFinal && spielzug.value == "") checkForSpielzug(result);
      if (result.isFinal && spielzug.value != "" && spieler.value == "") {
        checkForPlayer(result);
      }
      if (
        spielzug.value == "complete pass" ||
        spielzug.value == "run" ||
        spielzug.value == "first down" ||
        spielzug.value == "touchdown" ||
        spielzug.value == "interception" ||
        spielzug.value == "strafe"
      ) {
        needsYards.value = true;
      }
      if (needsYards.value && yards.value == "") checkForYards(result);
    }

    const t = Array.from(evt.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    transcript.value = t;
  };
});

const checkForSpielzug = (result) => {
  const t = result[0].transcript.toLowerCase();
  for (const item of config.spielzüge) {
    if (t.includes(item)) {
      spielzug.value = item;
      commands.value = "Wer war das Target";
      break;
    }
  }
};

const checkForPlayer = (result) => {
  const t = result[0].transcript;
  for (const item of config.players) {
    if (t.includes(item)) {
      spieler.value = item;
    }
  }
  checkSpielzugData();
};

const checkForYards = (result) => {
  const t = result[0].transcript;
  const number = t.match(/\d+/g);
  if (number) {
    yards.value = number[0];
  }
  checkSpielzugData();
};

const checkSpielzugData = () => {
  switch (spielzug.value) {
    case "incomplete pass":
      if (spieler.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "complete pass":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "run":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "drop":
      if (spieler.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "first down":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "touchdown":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "1 XP":
      if (spieler.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "2 XP":
      if (spieler.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "interception":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "deflection":
      if (spieler.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "tackle":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "bad snap":
      if (spieler.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    case "strafe":
      if (spieler.value != "" && yards.value != "") {
        writeToDatabase(
          spielzug.value,
          spieler.value,
          yards.value,
          sonstiges.value
        );
        resetInputs();
      }
      break;

    default:
      break;
  }
};

const resetInputs = () => {
  sr.stop();
  spielzug.value = "";
  spieler.value = "";
  yards.value = "";
  sonstiges.value = "";
};

const ToggleMic = () => {
  if (isRecording.value) {
    sr.stop();
  } else {
    sr.start();
  }
};
</script>

<template>
  <v-app>
    <v-container>
      <pre class="commands" v-text="commands"></pre>
      <v-btn :class="`mic`" @click="ToggleMic">Record</v-btn>
      <div class="transcript" v-text="transcript"></div>
    </v-container>
    <v-container class="results">
      <v-table>
        <thead>
          <tr>
            <th>Spielzug</th>
            <th>Spieler</th>
            <th>Yards</th>
            <th>Sonstiges</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ spielzug }}</td>
            <td>{{ spieler }}</td>
            <td>{{ yards }}</td>
            <td>{{ sonstiges }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </v-app>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #3b2452;
  color: #fff;
}
</style>
