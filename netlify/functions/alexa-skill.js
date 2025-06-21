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
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC849QjBQnmnIfL\nv+p2S6CWBlqnmas9g5nBPH4IXCAenZR/WpQKbGxn5kW6aZat7pRNdwfkDm+WLnvP\nu4JtEK54cILbgw/ifNW+Ot4uH9hXVV/Ixl6CS8/xI0RAxFzuCpVbVvj/OlChuMXp\n23zhGDOmvtvYH+Dptm0H74bOUwi+LxbrLVCm4mQb96h9HAJAVNptivgXrEDxJzyG\nq3sopZFmfiJecPSarHaHSvXcl8zNxV8OLltFoNUDraY7l/KXKWaYv26qKOpNIebp\nVClOuZXGwHwM1hNrZtYaPh+zB37aXnWS7eKQ9/HzE20U95nyjrkSSJyK01TQzvfH\nRsYrQttzAgMBAAECggEAVwuCgdTbmCtAJPO+317AlQI+moelMwbHPxZaWg3iO1mQ\nyhN6r0cBueuS7HGmH2cXbo9Q0paYc5PeOH+Hfi02yYfHtdKy6kNu2GgWZRkFwFE2\nf7ZybQb0v4Hp/RLAZG36IAp3Wl6MM8qLYdZkuPJHMys28mTWZ71Kh2KpM8FuAP21\nPWeeVzByj4233Bvzv7qw//2Wxw6DAQ3Et/XPyk9q3YGcfUO91OJtPsYdvxAWF3rV\nsMvURMWO5JiC/TeMCItKq/XIPi1MXgqoMzs0E3L+4pYrvUVseaWebeYgxx5Nf3cJ\nfFfiCTjIh4T6a/IuizLnYa9wIsNoeRKJ9qGOdCpBeQKBgQDppOD96c7W+jbIF9GP\nFNSv1IpDUmUIh0d5oactTy47r51eYvq8aH+siQumctsBMF3a3EkwZftD61DX9nb6\nuCflbqxFFyJes/FRJpmXXc1GscyuHkDULkjNH/wAngZt6TpLiGItVir7cBwQNQpK\nlVtJCrFr+fGYM62Hn9AdxC99NQKBgQDO9rI2n59H3I6bbpdXfykOJzEVbn4wsfO3\njic4mQaWPQpnARAVuZ6Ri9HFneuk1p8jVAAYzhW22S71q9n3dHp62w19aFvKDPh8\nNpuv/CMOWZyjLCwSf7vRFlydBBNppHdnfi34m9vKXyYI/dO9mSbWKJMHfKbzMK6B\nH2xgA+2TBwKBgAWVOQMYOScN5400dH90wfhJndwp9dwUT3Lql/IPOE2YzqvYtaEW\n5iYbSDn7+Ju4qiV2qhEL/ssKrm3ap9Ep4VosINWtzdZxeky0HWtuhF8yFG/8rRPk\n3zx3jS/+lqy9q/TuF1p5+qDzdtg0TECn/Pxr0v1/hXRbl8Pr3682ZuQZAoGBAIWN\ntnT/Tna+AhyVIf5pZWHnsonk8nOT8fTqO68POKvsmfDcQ7fxPz0m3+hJPw3xHWJb\ny3A2VNbYkbAhBJflxz/OaYcat9jLw/HL/21yJGEXPLgjQhFx8g48Aumj/q72XcMg\nLqQ2V3/hJJc6zM+Vq/UY28BCFS3rpUBXucS/5CgzAoGBALaVbQWr0Fvr+sk7oVWn\n9VHpF0Hg0MPE6i/UrbIoMx/tMCUC9pPCNCh3u0TF8HroLwfwQRwar+w7HWcbZuVk\nxieiUfBE0fV6Kc1lTX8r2v+K+6kSi182Sl2QYdzSG2qZe/az/8jZ/iqOHFeercPt\nW2qQh+98yGRMr93sdaynzvh8\n-----END PRIVATE KEY-----\n",
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

      if (snapshot.empty) {
        // Buscar por coincidencia parcial si no encuentra exacto
        const allSnapshot = await comprasRef.get();
        let found = false;

        for (const doc of allSnapshot.docs) {
          const data = doc.data();
          if (data.name.toLowerCase().includes(productName.toLowerCase())) {
            await doc.ref.delete();
            found = true;
            break;
          }
        }

        if (found) {
          const speakOutput = `He eliminado ${productName} de tu despensa.`;
          return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        } else {
          const speakOutput = `No encontré ${productName} en tu despensa.`;
          return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }
      } else {
        // Eliminar el primer producto encontrado
        const doc = snapshot.docs[0];
        await doc.ref.delete();

        const speakOutput = `He eliminado ${productName} de tu despensa.`;
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
      }
    } catch (error) {
      console.error("Error:", error);
      const speakOutput = "Lo siento, hubo un error al eliminar el producto.";
      return handlerInput.responseBuilder.speak(speakOutput).getResponse();
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
        const speakOutput = "Tu despensa ya está vacía.";
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
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
      }.`;

      return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput = "Lo siento, hubo un error al limpiar la despensa.";
      return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    }
  },
};

// Intent para listar productos (bonus)
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
          "Tu despensa está vacía. Puedes agregar productos diciendo 'agrega leche' por ejemplo.";
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
      }

      const products = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const productText = `${data.quantity} ${data.unit} de ${data.name}`;
        products.push(productText);
      });

      let speakOutput;
      if (products.length === 1) {
        speakOutput = `Tienes ${products[0]} en tu despensa.`;
      } else if (products.length <= 5) {
        const lastProduct = products.pop();
        speakOutput = `En tu despensa tienes: ${products.join(
          ", "
        )} y ${lastProduct}.`;
      } else {
        speakOutput = `Tienes ${
          products.length
        } productos en tu despensa. Los primeros son: ${products
          .slice(0, 3)
          .join(", ")} y otros más.`;
      }

      return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    } catch (error) {
      console.error("Error:", error);
      const speakOutput = "Lo siento, hubo un error al leer tu despensa.";
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
    const speakOutput = "Has entrado a la despensa inteligente de Daniel Uribe";

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //   .reprompt(
        //     'Puedes decir "agrega limones", "elimina pan" o "limpia la lista".'
        //   )
        .getResponse()
    );
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
      'Con tu despensa inteligente puedes: agregar productos diciendo "agrega leche", eliminar productos diciendo "elimina pan", limpiar toda la lista diciendo "limpia la lista", o ver qué hay diciendo "qué hay en la lista". ¿Qué quieres hacer?';

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
    RemoveProductIntentHandler,
    ClearListIntentHandler,
    ListProductsIntentHandler,
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
          "List products",
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
