import fs from 'fs';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import play from 'play-sound';
import mpg123 from 'mpg123'
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

// Configurar el reproductor de audio para usar mpg123
const audioPlayer = play({ player: 'mpg123' });

// Ruta del archivo de audio
const speechFile = path.resolve("App/speech.mp3");

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
  await createAudio(gptRes);
  console.log('\n');
}

// Función para crear un archivo de audio y reproducirlo
async function createAudio(text) {
  const mp3 = await openAiClient.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);

  audioPlayer.play(speechFile, async (err) => {
    if (err) {
      console.error('Error al reproducir el archivo de audio:', err);
      return;
    }
    console.log('El archivo de audio ha sido reproducido.');

    // Descomenta la siguiente línea para eliminar el archivo después de la reproducción
    await fs.promises.unlink(speechFile); 
    console.log('El archivo de audio ha sido eliminado.');
  });
}

// Iniciar el chat
startChat();
