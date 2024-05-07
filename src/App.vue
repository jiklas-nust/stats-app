<script setup>
import { ref, onMounted } from "vue";
import config from "./assets/config.json";
// import { writeToDatabase } from "./api/api";
import { useSpeechRecognition } from "./js/speechrecognition";

const commands = ref("");

const {
  transcript,
  isRecording,
  start,
  stop,
  spielzug,
  spieler,
  yards,
  sonstiges,
} = useSpeechRecognition(config, commands);

onMounted(() => {
  commands.value = config.spielzüge;
});

const ToggleMic = () => {
  if (isRecording.value) {
    stop();
  } else {
    start();
  }
};
</script>

<template>
  <v-app>
    <v-container>
      <pre class="commands" v-text="commands"></pre>
      <v-btn
        :class="{ 'is-recording': isRecording, 'not-recording': !isRecording }"
        @click="ToggleMic"
        >{{ isRecording }}</v-btn
      >
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

.is-recording {
  background-color: red;
  color: white;
}

.not-recording {
  background-color: green;
  color: white;
}
</style>
