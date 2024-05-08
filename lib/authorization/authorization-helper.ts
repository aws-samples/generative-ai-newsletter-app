/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as schemaMap from '../shared/api/types.json'
import { Kind, type OperationDefinitionNode, parse } from 'graphql'

import { type EntityItem, type AttributeValue } from '@aws-sdk/client-verifiedpermissions'
import { type Logger } from '@aws-lambda-powertools/logger'

export const getEntityItem = (schema: Record<string, any>, entityId: string, entityType: string, entityData?: Record<string, any>, optionals?: { logger?: Logger }): EntityItem => {
  const { logger } = optionals ?? {}
  if (logger !== undefined) {
    logger.debug(`getEntityItem: ${entityId} ${entityType}`)
  }
  const item: EntityItem = {
    identifier: {
      entityType: `GenAINewsletter::${entityType}`,
      entityId
    }
  }
  if (entityData !== undefined) {
    item.attributes = getEntityAttributes(schema, entityType, entityData, { logger })
  }
  return item
}

export const getEntityAttributes = (schema: Record<string, any>, entityType: string, entityData: Record<string, any>, optionals?: { logger?: Logger }): Record<string, AttributeValue> => {
  const avpSchema = schema.GenAINewsletter
  const entityAttributes: Record<string, AttributeValue> = {}
  if (avpSchema !== undefined && avpSchema.entityTypes !== undefined) {
    const entity = avpSchema.entityTypes[entityType]
    if (entity !== undefined && entity.shape !== undefined) {
      const shape = entity.shape
      if (shape !== undefined) {
        const attributes = shape.attributes as Record<string, any>
        if (attributes !== undefined) {
          Object.entries(attributes).forEach(([key, value]) => {
            let entityDataForKey
            if (value.type === 'Entity') {
              Object.keys(entityData).forEach((dataKey) => {
                if (entityData[dataKey].__typename !== undefined && entityData[dataKey].__typename === key) {
                  entityDataForKey = entityData[dataKey]
                }
              })
            } else {
              entityDataForKey = entityData[key]
            }
            if (entityDataForKey !== undefined && value.type !== undefined) {
              switch (value.type) {
                case 'Boolean':
                  entityAttributes[key] = {
                    boolean: entityDataForKey
                  }
                  break
                case 'Entity':
                  entityAttributes[key] = {
                    entityIdentifier: {
                      entityId: entityDataForKey.id,
                      entityType: `GenAINewsletter::${key}`
                    }
                  }
                  break
                case 'Long':
                  entityAttributes[key] = {
                    long: entityDataForKey
                  }
                  break
                case 'String':
                  entityAttributes[key] = {
                    string: entityDataForKey
                  }
                  break
                case 'Set':
                  // entityAttributes[key] = {
                  //   set: [...entityData[key]]
                  // }
                  break
                case 'Record':
                  break
              }
            }
          })
        }
      }
    }
  }
  return entityAttributes
}

export const lowercaseFirstLetter = (stringVal: string): string => {
  return stringVal.charAt(0).toLowerCase() + stringVal.slice(1)
}

export const queryToActionAuth = (query: string): string => {
  const ast = parse(query)
  const operationDefinition = ast.definitions.find(value => {
    return value.kind === Kind.OPERATION_DEFINITION
  }) as OperationDefinitionNode
  if (operationDefinition.selectionSet.kind === Kind.SELECTION_SET) {
    const queryFieldSelection = operationDefinition.selectionSet.selections.find((selection) => {
      return selection.kind === Kind.FIELD
    })
    if (queryFieldSelection !== undefined && queryFieldSelection !== null && queryFieldSelection.kind === Kind.FIELD) {
      return queryFieldSelection.name.value
    }
  }
  throw new Error('Unable to locate definition')
}

export const queryToResourceEntity = (query: string): string => {
  const action = queryToActionAuth(query)
  const queries = schemaMap.__schema.types.find((type) => {
    return type.name === 'Query' && type.kind === 'OBJECT'
  })
  if (queries === undefined || queries === null) {
    throw new Error('Unable to locate Query type')
  }
  const queryField = queries.fields?.find((field) => {
    return field.name === action
  })
  if (queryField?.type.name === null) {
    return mutationToResourceEntity(query)
  }
  if (queryField !== undefined) {
    return queryField.type.name
  } else {
    throw new Error('Unable to locate resource Entity')
  }
}

export const queryToResourcesEntity = (query: string): string => {
  const action = queryToActionAuth(query)
  const queries = schemaMap.__schema.types.find((type) => {
    return type.name === 'Query' && type.kind === 'OBJECT'
  })
  if (queries === undefined || queries === null) {
    throw new Error('Unable to locate Query type')
  }
  const queryFieldType = queries.fields?.find((field) => {
    return field.name === action
  })
  if (queryFieldType !== undefined) {
    const queryFieldTypeObject = schemaMap.__schema.types.find((type) => {
      return type.name === queryFieldType.type.name
    })
    const itemObject = queryFieldTypeObject?.fields?.find((fieldItem) => {
      return fieldItem.name === 'items'
    })
    if (itemObject !== undefined && itemObject.type.kind === 'LIST' && itemObject?.type?.ofType?.name !== undefined && itemObject?.type?.ofType?.name !== null) {
      return itemObject.type.ofType?.name
    }
  }
  throw new Error('Unable to locate resource Entity')
}

export const mutationToResourceEntity = (query: string): string => {
  const action = queryToActionAuth(query)
  const queries = schemaMap.__schema.types.find((type) => {
    return type.name === 'Mutation' && type.kind === 'OBJECT'
  })
  if (queries === undefined || queries === null) {
    throw new Error('Unable to locate Query type')
  }
  const queryField = queries.fields?.find((field) => {
    return field.name === action
  })
  if (queryField === undefined || queryField === null || queryField.type.kind !== Kind.OBJECT || queryField.type.name === null) {
    throw new Error('Unable to locate action')
  }
  return queryField.type.name
}
