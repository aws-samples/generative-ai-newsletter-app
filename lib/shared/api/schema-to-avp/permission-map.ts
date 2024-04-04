/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { type EntityItem, type AttributeValue } from '@aws-sdk/client-verifiedpermissions'

import { Logger } from '@aws-lambda-powertools/logger'

export enum AuthActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  LIST = 'LIST'
}

interface ActionDetailsInput {
  actionId: string
  resourceType: string
  resourceId?: string
}

export class ActionStatement {
  type: AuthActionType
  actionId: string
  resourceType: string
  resourceId: string | never
  private readonly logger: Logger
  constructor (actionDetails: ActionDetailsInput) {
    const { actionId, resourceType, resourceId } = actionDetails
    this.actionId = actionId
    this.resourceType = resourceType
    if (typeof resourceId === 'string') {
      this.resourceId = resourceId
    }
    this.logger = new Logger()
  }

  public readonly getEntityItem = (schema: Record<string, any>, entityId: string, entityType: string, entityData?: Record<string, any>): EntityItem => {
    this.logger.debug('getEntityItemCalled', { entityId, entityType, entityData })
    const item: EntityItem = {
      identifier: {
        entityType: `GenAINewsletter::${entityType}`,
        entityId
      }
    }
    if (entityData !== undefined) {
      this.logger.debug('entityData found', { entityData })
      item.attributes = this.getEntityAttributes(schema, entityType, entityData)
    }

    this.logger.debug('returning getEntityItem', { item })
    return item
  }

  private readonly getEntityAttributes = (schema: Record<string, any>, entityType: string, entityData: Record<string, any>): Record<string, AttributeValue> => {
    this.logger.debug('getEntityAttributes called', { entityType, entityData })
    const avpSchema = schema.GenAINewsletter
    const entityAttributes: Record<string, AttributeValue> = {}
    if (avpSchema !== undefined && avpSchema.entityTypes !== undefined) {
      this.logger.debug('getEntityAttributes - avpSchema with entityTypes', { entityType, entityData })
      const entity = avpSchema.entityTypes[entityType]
      if (entity !== undefined && entity.shape !== undefined) {
        const shape = entity.shape
        this.logger.debug('getEntityAttributes - Shape', { shape })
        if (shape !== undefined) {
          this.logger.debug('getEntityAttributes - Shape Found', { shape })
          const attributes = shape.attributes as Record<string, any>
          if (attributes !== undefined) {
            this.logger.debug('getEntityAttributes - Attributes Found', { attributes })
            Object.entries(attributes).forEach(([key, value]) => {
              this.logger.debug('getEntityAttributes - Attribute Found', { key, value })
              let entityDataForKey = entityData[key]
              if (entityDataForKey === undefined && value.type === 'Entity') {
                // Entity Objects have an Id in data that matches their type + Id
                entityDataForKey = entityData[key + 'Id']
              }
              if (entityDataForKey !== undefined && value.type !== undefined) {
                this.logger.debug('Entity type for switch', { value })
                switch (value.type) {
                  case 'Boolean':
                    entityAttributes[key] = {
                      boolean: entityDataForKey
                    }
                    break
                  case 'Entity':
                    entityAttributes[key] = {
                      entityIdentifier: {
                        entityId: entityDataForKey,
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
                    this.logger.debug('getEntityAttributes - Set Not Implemented', { key, value })
                    break
                  case 'Record':
                    break
                }
              }
            })
          }
        } else {
          this.logger.debug('getEntityAttributes - Shape Not Found', { shape, entity })
        }
      } else {
        this.logger.debug('getEntityAttributes - Entity Not Found', { entity })
      }
    }
    this.logger.debug('getEntityAttributes - Returning Attributes', { entityAttributes })
    return entityAttributes
  }
}

export class CreateActionStatement extends ActionStatement {
  type = AuthActionType.CREATE
}

export class ReadActionStatement extends ActionStatement {
  type = AuthActionType.READ
  resourceId: string
}

export class ListActionStatement extends ActionStatement {
  type = AuthActionType.LIST
  resourceId: never
}

export class UpdateActionStatement extends ActionStatement {
  type = AuthActionType.UPDATE
  readActionStatement: ReadActionStatement
  constructor (actionDetails: ActionDetailsInput, readActionStatement: ReadActionStatement) {
    super(actionDetails)
    this.readActionStatement = readActionStatement
  }
}
