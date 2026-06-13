import { oc } from '@orpc/contract';
import {
  catalogOutputSchema,
  collectionOutputSchema,
} from '../../common/card.schemas.js';
import {
  cardTypeParamsSchema,
  cardUserIdParamsSchema,
  catalogTypeOutputSchema,
} from './schemas.js';

export const cardsErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Not authorized, no user found',
  },
  USER_NOT_FOUND: {
    status: 404,
    message: 'Usuario no encontrado',
  },
  INVALID_CARD_TYPE: {
    status: 400,
    message: 'Tipo de carta no válido',
  },
} as const;

export const cardsContract = oc
  .tag('Cards')
  .prefix('/cards')
  .router({
    getCatalog: oc
      .route({
        method: 'GET',
        path: '/catalog',
        description: 'Get the full read-only card catalog',
      })
      .output(catalogOutputSchema),

    getCatalogByType: oc
      .route({
        method: 'GET',
        path: '/catalog/{type}',
        inputStructure: 'detailed',
        description: 'Get catalog filtered by card type',
      })
      .input(cardTypeParamsSchema)
      .errors(cardsErrors)
      .output(catalogTypeOutputSchema),

    getMyCollection: oc
      .route({
        method: 'GET',
        path: '/me',
        description: 'Get authenticated user card collection',
      })
      .errors(cardsErrors)
      .output(collectionOutputSchema),

    getMyCollectionByType: oc
      .route({
        method: 'GET',
        path: '/me/{type}',
        inputStructure: 'detailed',
        description: 'Get authenticated user collection filtered by type',
      })
      .input(cardTypeParamsSchema)
      .errors(cardsErrors)
      .output(catalogTypeOutputSchema),

    getUserCollection: oc
      .route({
        method: 'GET',
        path: '/users/{userId}',
        inputStructure: 'detailed',
        description: 'Get another user public card collection',
      })
      .input(cardUserIdParamsSchema)
      .errors(cardsErrors)
      .output(collectionOutputSchema),
  });
