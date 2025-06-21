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
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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

// Constantes de Firebase
const COLLECTION_NAME = "col-sala";
const SUBCOLLECTION_NAME = "lista-super";
const ITEMS_COLLECTION = "compras";

// Helper function para obtener referencia de la colección
function getComprasRef() {
  return db
    .collection(COLLECTION_NAME)
    .doc(SUBCOLLECTION_NAME)
    .collection(ITEMS_COLLECTION);
}

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

      const comprasRef = getComprasRef();

      const newItem = {
        name: productName,
        category: "pantry",
        purchased: false,
        estimatedPrice: 0,
        quantity: parseInt(quantity) || 1,
        unit: unit,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await comprasRef.add(newItem);

      const speakOutput = `He agregado ${quantity} ${unit} de ${productName} a tu despensa. ¿Quieres agregar algo más, eliminar algún producto, o prefieres que termine?`;
      const repromptOutput = "¿Hay algo más que quieras hacer con tu despensa?";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput =
        "Lo siento, hubo un error al agregar el producto a tu despensa. ¿Quieres intentar de nuevo?";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué te gustaría hacer?")
        .getResponse();
    }
  },
};

// Intent para eliminar productos
const RemoveProductIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "RemoveProductIntent"
    );
  },
  async handle(handlerInput) {
    try {
      const slots = handlerInput.requestEnvelope.request.intent.slots;
      const productName = slots.product?.value || "";

      if (!productName) {
        const speakOutput = "¿Qué producto quieres eliminar?";
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .getResponse();
      }

      const comprasRef = getComprasRef();

      // Buscar el producto por nombre (case insensitive)
      const snapshot = await comprasRef
        .where("name", ">=", productName.toLowerCase())
        .where("name", "<=", productName.toLowerCase() + "\uf8ff")
        .get();

      let speakOutput;
      let found = false;

      if (snapshot.empty) {
        // Buscar por coincidencia parcial si no encuentra exacto
        const allSnapshot = await comprasRef.get();

        for (const doc of allSnapshot.docs) {
          const data = doc.data();
          if (data.name.toLowerCase().includes(productName.toLowerCase())) {
            await doc.ref.delete();
            found = true;
            break;
          }
        }

        if (found) {
          speakOutput = `He eliminado ${productName} de tu despensa. ¿Quieres hacer algo más?`;
        } else {
          speakOutput = `No encontré ${productName} en tu despensa. ¿Quieres intentar con otro producto o hacer algo más?`;
        }
      } else {
        // Eliminar el primer producto encontrado
        const doc = snapshot.docs[0];
        await doc.ref.delete();
        speakOutput = `He eliminado ${productName} de tu despensa. ¿Hay algo más que quieras hacer?`;
      }

      const repromptOutput = "¿Qué más te gustaría hacer con tu despensa?";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput =
        "Lo siento, hubo un error al eliminar el producto. ¿Quieres intentar de nuevo?";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué te gustaría hacer?")
        .getResponse();
    }
  },
};

// Intent para limpiar toda la lista
const ClearListIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ClearListIntent"
    );
  },
  async handle(handlerInput) {
    try {
      const comprasRef = getComprasRef();
      const snapshot = await comprasRef.get();

      if (snapshot.empty) {
        const speakOutput =
          "Tu despensa ya está vacía. ¿Quieres agregar algunos productos?";
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("¿Qué te gustaría hacer?")
          .getResponse();
      }

      // Eliminar todos los documentos
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      const count = snapshot.size;
      const speakOutput = `He limpiado tu despensa. Eliminé ${count} ${
        count === 1 ? "producto" : "productos"
      }. ¿Quieres agregar nuevos productos o hacer algo más?`;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué más te gustaría hacer?")
        .getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput =
        "Lo siento, hubo un error al limpiar la despensa. ¿Quieres intentar de nuevo?";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué te gustaría hacer?")
        .getResponse();
    }
  },
};

// Intent para listar productos (resumen)
const ListProductsIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "ListProductsIntent"
    );
  },
  async handle(handlerInput) {
    try {
      const comprasRef = getComprasRef();
      const snapshot = await comprasRef.orderBy("createdAt", "desc").get();

      if (snapshot.empty) {
        const speakOutput =
          "Tu despensa está vacía. ¿Quieres agregar algunos productos?";
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("¿Qué productos te gustaría agregar?")
          .getResponse();
      }

      const products = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const productText = `${data.quantity} ${data.unit} de ${data.name}`;
        products.push(productText);
      });

      let speakOutput;
      if (products.length === 1) {
        speakOutput = `Tienes ${products[0]} en tu despensa. ¿Quieres agregar algo más?`;
      } else if (products.length <= 5) {
        const lastProduct = products.pop();
        speakOutput = `En tu despensa tienes: ${products.join(
          ", "
        )} y ${lastProduct}. ¿Hay algo más que quieras hacer?`;
      } else {
        speakOutput = `Tienes ${
          products.length
        } productos en tu despensa. Los primeros son: ${products
          .slice(0, 3)
          .join(
            ", "
          )} y otros más. ¿Quieres que te lea toda la lista completa o prefieres hacer algo más?`;
      }

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué más te gustaría hacer con tu despensa?")
        .getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput =
        "Lo siento, hubo un error al leer tu despensa. ¿Quieres intentar de nuevo?";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué te gustaría hacer?")
        .getResponse();
    }
  },
};

// Intent para leer toda la lista completa
const ReadCompleteListIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "ReadCompleteListIntent"
    );
  },
  async handle(handlerInput) {
    try {
      const comprasRef = getComprasRef();
      const snapshot = await comprasRef.orderBy("createdAt", "desc").get();

      if (snapshot.empty) {
        const speakOutput =
          "Tu despensa está vacía. No hay productos registrados. ¿Quieres agregar algunos productos?";
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("¿Qué productos te gustaría agregar?")
          .getResponse();
      }

      const products = [];
      let totalItems = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const productText = `${data.quantity} ${data.unit} de ${data.name}`;
        products.push(productText);
        totalItems += parseInt(data.quantity) || 1;
      });

      let speakOutput;

      if (products.length === 1) {
        speakOutput = `Tu lista de compras completa tiene un solo producto: ${
          products[0]
        }. En total tienes ${totalItems} ${
          totalItems === 1 ? "artículo" : "artículos"
        }. ¿Quieres hacer algo más?`;
      } else {
        // Para listas largas, agregar pausas para mejor comprensión
        const productList = products.join(", <break time='0.3s'/> ");
        speakOutput = `Tu lista de compras completa tiene ${
          products.length
        } productos: <break time='0.5s'/> ${productList}. <break time='0.5s'/> En total tienes ${totalItems} ${
          totalItems === 1 ? "artículo" : "artículos"
        } en tu despensa. ¿Hay algo más que quieras hacer?`;
      }

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué más te gustaría hacer con tu despensa?")
        .getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput =
        "Lo siento, hubo un error al leer tu lista completa. ¿Quieres intentar de nuevo?";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("¿Qué te gustaría hacer?")
        .getResponse();
    }
  },
};

// Intent para manejar respuestas afirmativas
const YesIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.YesIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Perfecto. ¿Qué quieres hacer? Puedes agregar productos, eliminar algo, limpiar la lista o ver qué hay en tu despensa.";
    const repromptOutput = "¿Qué te gustaría hacer con tu despensa?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

// Intent para manejar respuestas negativas
const NoIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.NoIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "¡Perfecto! Tu despensa está lista. ¡Hasta luego!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
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
    const speakOutput = "¡Bienvenido a la despensa de Daniel!";
    const repromptOutput = "¿Qué quieres hacer";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
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
      'Con tu despensa inteligente puedes: agregar productos diciendo "agrega leche", eliminar productos diciendo "elimina pan", limpiar toda la lista diciendo "limpia la lista", ver un resumen diciendo "qué hay en la lista", o escuchar toda tu lista completa diciendo "lee toda mi lista". ¿Qué quieres hacer?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("¿Qué quieres hacer con tu despensa?")
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
    const speakOutput =
      "¡Hasta luego! Tu despensa estará lista cuando regreses.";
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
      "Lo siento, tuve problemas para hacer lo que pediste. ¿Quieres intentarlo de nuevo?";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("¿Qué te gustaría hacer?")
      .getResponse();
  },
};

// Skill builder
const skillBuilder = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AddProductIntentHandler,
    RemoveProductIntentHandler,
    ClearListIntentHandler,
    ListProductsIntentHandler,
    ReadCompleteListIntentHandler,
    YesIntentHandler,
    NoIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler);

// Función de Netlify
exports.handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Alexa Skill Function is running!",
        features: [
          "Add products",
          "Remove products",
          "Clear list",
          "List products (summary)",
          "Read complete list",
          "Conversational flow",
        ],
        timestamp: new Date().toISOString(),
      }),
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "No request body provided" }),
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
      body: JSON.stringify({
        error: "Error interno del servidor",
        details: error.message,
      }),
    };
  }
};
