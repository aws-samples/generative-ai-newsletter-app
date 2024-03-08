import { type PluginFunction } from '@graphql-codegen/plugin-helpers'
import { type GraphQLSchema } from 'graphql'
import { factory, SyntaxKind, type PropertyDeclaration, type ClassDeclaration, type ImportDeclaration, createSourceFile, ScriptTarget, ScriptKind, NewLineKind, createPrinter, EmitHint, type ClassElement } from 'typescript'

export const plugin: PluginFunction = async (schema: GraphQLSchema): Promise<string> => {
  const queryFields = schema.getQueryType()?.getFields()
  const declarations: PropertyDeclaration[] = []
  const allResolvers = []
  if (queryFields !== undefined) {
    console.log('Adding Query Type to Permission Map')
    const resolvers = []
    for (const resolver in queryFields) {
      resolvers.push(resolver)
      allResolvers.push(resolver)
    }
    declarations.push(...generateReadDecalarations(resolvers))
  } else {
    console.log('No Query Types to Need Permissions')
  }
  const mutationFields = schema.getMutationType()?.getFields()
  if (mutationFields !== undefined) {
    console.log('Adding Mutation Type to Permission Map')
    const resolvers = []
    for (const resolver in mutationFields) {
      resolvers.push(resolver)
      allResolvers.push(resolver)
    }
    declarations.push(...generateWriteDeclarations(resolvers))
  } else {
    console.log('No Mutation Types to Need Permissions')
  }
  const subscriptionFields = schema.getSubscriptionType()?.getFields()
  if (subscriptionFields !== undefined) {
    const resolvers = []
    for (const resolver in subscriptionFields) {
      resolvers.push(resolver)
      allResolvers.push(resolver)
    }
    declarations.push(...generateReadDecalarations(resolvers))
  } else {
    console.log('No Subscription Types to Need Permissions')
  }
  declarations.push(generateMethodGetter(allResolvers))
  const printer = createPrinter({ newLine: NewLineKind.LineFeed })
  const sourceFile = createSourceFile(
    'action-authorizer.ts',
    '',
    ScriptTarget.Latest,
    false,
    ScriptKind.TS
  )
  return printer.printNode(EmitHint.Unspecified, importDefiniton(), sourceFile) +
  printer.printNode(EmitHint.Unspecified, generateTypescript(declarations), sourceFile)
}

const generateReadDecalarations = (resolvers: string[]): PropertyDeclaration[] => {
  const declarations = []
  for (const resolver of resolvers) {
    declarations.push(factory.createPropertyDeclaration(
      [factory.createToken(SyntaxKind.AbstractKeyword)],
      factory.createIdentifier(resolver),
      undefined,
      factory.createUnionTypeNode([
        factory.createTypeReferenceNode(
          factory.createIdentifier('ReadActionStatement'),
          undefined
        ),
        factory.createTypeReferenceNode(
          factory.createIdentifier('ListActionStatement'),
          undefined
        )
      ]),
      undefined
    ))
  }
  return declarations
}

const generateWriteDeclarations = (resolvers: string[]): PropertyDeclaration[] => {
  const declarations = []
  for (const resolver of resolvers) {
    declarations.push(factory.createPropertyDeclaration(
      [factory.createToken(SyntaxKind.AbstractKeyword)],
      factory.createIdentifier(resolver),
      undefined,
      factory.createUnionTypeNode([
        factory.createTypeReferenceNode(
          factory.createIdentifier('CreateActionStatement'),
          undefined
        ),
        factory.createTypeReferenceNode(
          factory.createIdentifier('UpdateActionStatement'),
          undefined
        )
      ]),
      undefined
    ))
  }
  return declarations
}

const generateMethodGetter = (resolvers: string[]): PropertyDeclaration => {
  const resolverCases = resolvers.map((resolver) => {
    return (
      factory.createCaseClause(
        factory.createStringLiteral(resolver),
        [factory.createReturnStatement(factory.createPropertyAccessExpression(
          factory.createThis(),
          factory.createIdentifier(resolver)
        ))]
      ))
  })
  return factory.createPropertyDeclaration(
    undefined,
    factory.createIdentifier('getResolverPermission'),
    undefined,
    undefined,
    factory.createArrowFunction(
      undefined,
      undefined,
      [factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier('resolverName'),
        undefined,
        factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
        undefined
      )],
      factory.createUnionTypeNode([
        factory.createTypeReferenceNode(
          factory.createIdentifier('ReadActionStatement'),
          undefined
        ),
        factory.createTypeReferenceNode(
          factory.createIdentifier('UpdateActionStatement'),
          undefined
        ),
        factory.createTypeReferenceNode(
          factory.createIdentifier('CreateActionStatement'),
          undefined
        )
      ]),
      factory.createToken(SyntaxKind.EqualsGreaterThanToken),
      factory.createBlock(
        [factory.createSwitchStatement(
          factory.createIdentifier('resolverName'),
          factory.createCaseBlock([
            ...resolverCases,
            factory.createDefaultClause([factory.createThrowStatement(factory.createNewExpression(
              factory.createIdentifier('Error'),
              undefined,
              [factory.createBinaryExpression(
                factory.createStringLiteral('Resolver Permission not found for '),
                factory.createToken(SyntaxKind.PlusToken),
                factory.createIdentifier('resolverName')
              )]
            ))])
          ])
        )],
        true
      )
    )
  )
}

const generateTypescript = (declarations: ClassElement[]): ClassDeclaration => {
  return factory.createClassDeclaration(
    [
      factory.createToken(SyntaxKind.ExportKeyword),
      factory.createToken(SyntaxKind.AbstractKeyword)
    ],
    factory.createIdentifier('ResolverPermissionMapBase'),
    undefined,
    undefined,
    declarations
  )
}

const importDefiniton = (): ImportDeclaration => {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('ReadActionStatement')
        ),
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('ListActionStatement')
        ),
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('CreateActionStatement')
        ),
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('UpdateActionStatement')
        )
      ])
    ),
    factory.createStringLiteral('./permission-map'),
    undefined
  )
}
