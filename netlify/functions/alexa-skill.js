const Alexa = require("ask-sdk-core");

// Configuración de Firebase Admin (servidor)
const admin = require("firebase-admin");

// Inicializar Firebase Admin solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      universe_domain: "googleapis.com",
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

// Constantes de Firebase (las mismas que en tu React)
const COLLECTION_NAME = "col-sala";
const SUBCOLLECTION_NAME = "lista-super";
const ITEMS_COLLECTION = "compras";

// Intent para agregar productos
const AddProductIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AddProductIntent"
    );
  },
  async handle(handlerInput) {
    try {
      const slots = handlerInput.requestEnvelope.request.intent.slots;
      const productName = slots.product?.value || "producto";
      const quantity = slots.quantity?.value || "1";
      const unit = slots.unit?.value || "unidad";

      // Agregar a Firebase
      const comprasRef = db
        .collection(COLLECTION_NAME)
        .doc(SUBCOLLECTION_NAME)
        .collection(ITEMS_COLLECTION);

      const newItem = {
        name: productName,
        category: "General", // Categoría por defecto
        purchased: false,
        estimatedPrice: 0,
        quantity: parseInt(quantity) || 1,
        unit: unit,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await comprasRef.add(newItem);

      const speakOutput = `He agregado ${quantity} ${unit} de ${productName} a tu despensa.`;

      return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput =
        "Lo siento, hubo un error al agregar el producto a tu despensa.";

      return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    }
  },
};

// Intent de bienvenida
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      'Hola, bienvenido a tu despensa inteligente. Puedes decir "agrega leche" o "agrega dos kilos de arroz" para añadir productos.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// Intent de ayuda
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      'Puedes decir "agrega leche", "agrega dos kilos de arroz" o "agrega tres litros de agua" para añadir productos a tu despensa.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// Intent de cancelar/parar
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "¡Hasta luego!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

// Intent de sesión terminada
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log(
      `~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

// Manejador de errores
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Lo siento, tuve problemas para hacer lo que pediste. Inténtalo de nuevo.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// Skill builder
const skillBuilder = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AddProductIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler);

// Función de Netlify
exports.handler = async (event, context) => {
  // Configurar headers CORS
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  };

  // Manejar preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const skill = skillBuilder.create();
    const requestBody = JSON.parse(event.body);

    const response = await skill.invoke(requestBody);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error en la función:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
