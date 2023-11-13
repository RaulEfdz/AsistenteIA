import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import play from 'play-sound';

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

// Reproductor de audio
const audioPlayer = play();

// Ruta del archivo de audio
const speechFile = path.resolve('app/peech.mp3');

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

  const gptRes = gptResponse.choices[0].message.content;
  console.log(`   GPT: ${gptRes}`);
  await createAndPlayAudio(gptRes); // Crear y reproducir el audio
  console.log('\n');
}

// Función para crear un archivo de audio a partir de texto y reproducirlo
async function createAndPlayAudio(text) {
  try {
    const response = await openAiClient.audio.speech.create({
      model: "text-davinci-003",
      voice: "alloy",
      input: text
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    console.log(`El audio ha sido guardado en: ${speechFile}`);

    // Reproducir el audio
    audioPlayer.play(speechFile, (err) => {
      if (err) {
        console.error('Error al reproducir el archivo de audio:', err);
      }
    });
  } catch (error) {
    console.error('Error al generar el audio:', error);
  }
}

// Iniciar el chat
startChat();