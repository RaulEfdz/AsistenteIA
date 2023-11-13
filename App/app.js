import fs from "fs";
import OpenAI from 'openai';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import play from 'play-sound';

// Reproductor de audio
const audioPlayer = play();

// Cargar las variables de entorno
dotenv.config();


// Inicializar el cliente de OpenAI
const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Crear una interfaz de readline para interactuar con la consola
const consoleInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para iniciar el ciclo de chat
function startChat() {
  consoleInterface.question('Yo: ', async (userInput) => {
    await generateResponse(userInput);
    startChat(); // Continuar con el siguiente ciclo de chat
  });
}

// Función para generar y mostrar la respuesta de GPT
async function generateResponse(userInput) {
  const gptResponse = await openAiClient.chat.completions.create({
    messages: [{ role: "system", content: userInput }],
    model: "gpt-3.5-turbo",
  });

  const gptRes = gptResponse.choices[0].message.content
  console.log(`   GPT: ${gptRes}`);
  createAudio(gptRes)
  console.log('\n');
}
const speechFile = path.resolve("App/speech.mp3");

async function createAudio(text) {
  const mp3 = await openAiClient.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });
  // console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);

  audioPlayer.play(speechFile, async (err) => {
    if (err) {
      console.error('Error al reproducir el archivo de audio:', err);
    }
    // await fs.promises.unlink(speechFile); // Elimina el archivo después de la reproducción
    console.log('El archivo de audio ha sido eliminado.');
  });
}

// Iniciar el chat
startChat();
