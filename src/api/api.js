export const writeToDatabase = (spielzug, spieler, yards, __sonstiges) => {
  if (yards == "") {
    console.log("Ein", spielzug, "von", spieler, ".");
  } else {
    console.log("Ein", spielzug, "von", spieler, "für", yards, "Yards.");
  }
};
