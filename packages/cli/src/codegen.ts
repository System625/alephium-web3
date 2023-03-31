/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { node, Project, Script, Contract, EventSig, StdIdFieldName } from '@alephium/web3'
import * as prettier from 'prettier'
import path from 'path'
import fs from 'fs'

const header = `/* Autogenerated file. Do not edit manually. */\n/* tslint:disable */\n/* eslint-disable */\n\n`

function array(str: string, size: number): string {
  const result = Array(size).fill(str).join(', ')
  return `[${result}]`
}

function parseArrayType(tpe: string): string {
  const ignored = '[;]'
  const tokens: string[] = []
  let acc = ''
  for (let index = 0; index < tpe.length; index++) {
    if (!ignored.includes(tpe.charAt(index))) {
      acc = acc + tpe.charAt(index)
    } else if (acc !== '') {
      tokens.push(acc)
      acc = ''
    }
  }
  const baseTsType = toTsType(tokens[0])
  const sizes = tokens.slice(1).map((str) => parseInt(str))
  return sizes.reduce((acc, size) => array(acc, size), baseTsType)
}

function toTsType(ralphType: string): string {
  switch (ralphType) {
    case 'U256':
    case 'I256':
      return 'bigint'
    case 'Bool':
      return 'boolean'
    case 'Address':
    case 'ByteVec':
      return 'HexString'
    default: // array type
      return parseArrayType(ralphType)
  }
}

function formatParameters(fieldsSig: { names: string[]; types: string[] }): string {
  return fieldsSig.names
    .map((name, idx) => (name === StdIdFieldName ? '' : `${name}: ${toTsType(fieldsSig.types[`${idx}`])}`))
    .filter((str) => str !== '')
    .join(', ')
}

function genCallMethod(contractName: string, functionSig: node.FunctionSig): string {
  const funcHasArgs = functionSig.paramNames.length > 0
  const params = `params${funcHasArgs ? '' : '?'}: ${contractName}Types.CallMethodParams<'${functionSig.name}'>`
  const retType = `${contractName}Types.CallMethodResult<'${functionSig.name}'>`
  const callParams = funcHasArgs ? 'params' : 'params === undefined ? {} : params'
  return `
    ${functionSig.name}: async (${params}): Promise<${retType}> => {
      return callMethod(${contractName}, this, "${functionSig.name}", ${callParams})
    }
  `
}

function genCallMethods(contract: Contract): string {
  const functions = contract.functions.filter((f) => f.isPublic && f.returnTypes.length > 0)
  if (functions.length === 0) {
    return ''
  }
  return `
    methods = {
      ${functions.map((f) => genCallMethod(contract.name, f)).join(',')}
    }
  `
}

function getInstanceName(contract: Contract): string {
  return `${contract.name}Instance`
}

function genAttach(instanceName: string): string {
  return `
  at(address: string): ${instanceName} {
    return new ${instanceName}(address)
  }
  `
}

function contractTypes(contractName: string): string {
  return `${contractName}Types`
}

function contractFieldType(contractName: string, fieldsSig: node.FieldsSig): string {
  const hasFields = fieldsSig.names.length > 0
  return hasFields ? `${contractTypes(contractName)}.Fields` : '{}'
}

function genFetchState(contract: Contract): string {
  return `
  async fetchState(): Promise<${contractTypes(contract.name)}.State> {
    return fetchContractState(${contract.name}, this)
  }
  `
}

function getEventType(event: EventSig): string {
  return event.name + 'Event'
}

function genEventType(event: EventSig): string {
  if (event.fieldNames.length === 0) {
    return `export type ${getEventType(event)} = Omit<ContractEvent, 'fields'>`
  }
  const fieldsType = `{${formatParameters({ names: event.fieldNames, types: event.fieldTypes })}}`
  return `export type ${getEventType(event)} = ContractEvent<${fieldsType}>`
}

function genGetContractEventsCurrentCount(contract: Contract): string {
  if (contract.eventsSig.length === 0) {
    return ''
  }
  return `
    async getContractEventsCurrentCount(): Promise<number> {
      return getContractEventsCurrentCount(this.address)
    }
  `
}

function genSubscribeEvent(contractName: string, event: EventSig): string {
  const eventType = getEventType(event)
  const scopedEventType = `${contractTypes(contractName)}.${eventType}`
  return `
    subscribe${eventType}(options: SubscribeOptions<${scopedEventType}>, fromCount?: number): EventSubscription {
      return subscribeContractEvent(${contractName}.contract, this, options, "${event.name}", fromCount)
    }
  `
}

function genSubscribeAllEvents(contract: Contract): string {
  if (contract.eventsSig.length <= 1) {
    return ''
  }
  const eventTypes = contract.eventsSig.map((e) => `${contractTypes(contract.name)}.${getEventType(e)}`).join(' | ')
  return `
    subscribeAllEvents(options: SubscribeOptions<${eventTypes}>, fromCount?: number): EventSubscription {
      return subscribeContractEvents(${contract.name}.contract, this, options, fromCount)
    }
  `
}

function genContractStateType(contract: Contract): string {
  if (contract.fieldsSig.names.length === 0) {
    return `export type State = Omit<ContractState<any>, 'fields'>`
  }
  return `
    export type Fields = {
      ${formatParameters(contract.fieldsSig)}
    }

    export type State = ContractState<Fields>
  `
}

function genTestMethod(contractName: string, fieldsSig: node.FieldsSig, functionSig: node.FunctionSig): string {
  const funcHasArgs = functionSig.paramNames.length > 0
  const contractHasFields = fieldsSig.names.length > 0
  const argsType = funcHasArgs
    ? `{${formatParameters({ names: functionSig.paramNames, types: functionSig.paramTypes })}}`
    : 'never'
  const fieldsType = contractHasFields ? `${contractFieldType(contractName, fieldsSig)}` : 'never'
  const params =
    funcHasArgs && contractHasFields
      ? `params: TestContractParams<${fieldsType}, ${argsType}>`
      : funcHasArgs
      ? `params: Omit<TestContractParams<${fieldsType}, ${argsType}>, 'initialFields'>`
      : contractHasFields
      ? `params: Omit<TestContractParams<${fieldsType}, ${argsType}>, 'testArgs'>`
      : `params?: Omit<TestContractParams<${fieldsType}, ${argsType}>, 'testArgs' | 'initialFields'>`
  const tsReturnTypes = functionSig.returnTypes.map((tpe) => toTsType(tpe))
  const retType =
    tsReturnTypes.length === 0
      ? `TestContractResult<null>`
      : tsReturnTypes.length === 1
      ? `TestContractResult<${tsReturnTypes[0]}>`
      : `TestContractResult<[${tsReturnTypes.join(', ')}]>`
  const callParams = funcHasArgs || contractHasFields ? 'params' : 'params === undefined ? {} : params'
  return `
    ${functionSig.name}: async (${params}): Promise<${retType}> => {
      return testMethod(this, "${functionSig.name}", ${callParams})
    }
  `
}

function genTestMethods(contract: Contract, fieldsSig: node.FieldsSig): string {
  return `
    tests = {
      ${contract.functions.map((f) => genTestMethod(contract.name, fieldsSig, f)).join(',')}
    }
  `
}

function genCallMethodTypes(contract: Contract): string {
  const entities = contract.functions
    .filter((functionSig) => functionSig.isPublic && functionSig.returnTypes.length > 0)
    .map((functionSig) => {
      const funcHasArgs = functionSig.paramNames.length > 0
      const params = funcHasArgs
        ? `CallContractParams<{${formatParameters({
            names: functionSig.paramNames,
            types: functionSig.paramTypes
          })}}>`
        : `Omit<CallContractParams<{}>, 'args'>`
      const tsReturnTypes = functionSig.returnTypes.map((tpe) => toTsType(tpe))
      const retType =
        tsReturnTypes.length === 0
          ? `CallContractResult<null>`
          : tsReturnTypes.length === 1
          ? `CallContractResult<${tsReturnTypes[0]}>`
          : `CallContractResult<[${tsReturnTypes.join(', ')}]>`
      return `
      ${functionSig.name}: {
        params: ${params}
        result: ${retType}
      }
    `
    })
  return entities.length > 0
    ? `
      export interface CallMethodTable{
        ${entities.join(',')}
      }
      export type CallMethodParams<T extends keyof CallMethodTable> = CallMethodTable[T]['params']
      export type CallMethodResult<T extends keyof CallMethodTable> = CallMethodTable[T]['result']
      export type MultiCallParams = Partial<{ [Name in keyof CallMethodTable]: CallMethodTable[Name]['params'] }>
      export type MultiCallResults<T extends MultiCallParams> = { [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable ? CallMethodTable[MaybeName]['result'] : undefined }
    `
    : ''
}

function genMulticall(contract: Contract): string {
  const types = contractTypes(contract.name)
  const supportMulticall =
    contract.functions.filter((functionSig) => functionSig.isPublic && functionSig.returnTypes.length > 0).length > 0
  return supportMulticall
    ? `
      async multicall<Calls extends ${types}.MultiCallParams>(
        calls: Calls
      ): Promise<${types}.MultiCallResults<Calls>> {
        return (await multicallMethods(${contract.name}, this, calls)) as ${types}.MultiCallResults<Calls>
      }
    `
    : ''
}

function toUnixPath(p: string): string {
  return p.split(path.sep).join(path.posix.sep)
}

function getContractFields(contract: Contract): node.FieldsSig {
  const stdIdFieldIndex = contract.fieldsSig.names.findIndex((name) => name === StdIdFieldName)
  if (stdIdFieldIndex === -1) {
    return contract.fieldsSig
  }
  return {
    names: contract.fieldsSig.names.filter((_, index) => index !== stdIdFieldIndex),
    types: contract.fieldsSig.types.filter((_, index) => index !== stdIdFieldIndex),
    isMutable: contract.fieldsSig.isMutable.filter((_, index) => index !== stdIdFieldIndex)
  }
}

function genContract(contract: Contract, artifactRelativePath: string): string {
  const fieldsSig = getContractFields(contract)
  const projectArtifact = Project.currentProject.projectArtifact
  const contractInfo = projectArtifact.infos.get(contract.name)
  if (contractInfo === undefined) {
    throw new Error(`Contract info does not exist: ${contract.name}`)
  }
  const source = `
    ${header}

    import {
      Address, Contract, ContractState, TestContractResult, HexString, ContractFactory,
      SubscribeOptions, EventSubscription, CallContractParams, CallContractResult,
      TestContractParams, ContractEvent, subscribeContractEvent, subscribeContractEvents,
      testMethod, callMethod, multicallMethods, fetchContractState,
      ContractInstance, getContractEventsCurrentCount
    } from '@alephium/web3'
    import { default as ${contract.name}ContractJson } from '../${toUnixPath(artifactRelativePath)}'

    // Custom types for the contract
    export namespace ${contract.name}Types {
      ${genContractStateType(contract)}
      ${contract.eventsSig.map((e) => genEventType(e)).join('\n')}
      ${genCallMethodTypes(contract)}
    }

    class Factory extends ContractFactory<${contract.name}Instance, ${contractFieldType(contract.name, fieldsSig)}> {
      ${genAttach(getInstanceName(contract))}
      ${genTestMethods(contract, fieldsSig)}
    }

    // Use this object to test and deploy the contract
    export const ${contract.name} = new Factory(Contract.fromJson(
      ${contract.name}ContractJson,
      '${contractInfo.bytecodeDebugPatch}',
      '${contractInfo.codeHashDebug}',
    ))

    // Use this class to interact with the blockchain
    export class ${contract.name}Instance extends ContractInstance {
      constructor(address: Address) {
        super(address)
      }

      ${genFetchState(contract)}
      ${genGetContractEventsCurrentCount(contract)}
      ${contract.eventsSig.map((e) => genSubscribeEvent(contract.name, e)).join('\n')}
      ${genSubscribeAllEvents(contract)}
      ${genCallMethods(contract)}
      ${genMulticall(contract)}
    }
`
  return prettier.format(source, { parser: 'typescript' })
}

function genScript(script: Script): string {
  console.log(`Generating code for script ${script.name}`)
  const usePreapprovedAssets = script.functions[0].usePreapprovedAssets
  const fieldsType = script.fieldsSig.names.length > 0 ? `{${formatParameters(script.fieldsSig)}}` : '{}'
  const paramsType = usePreapprovedAssets
    ? `ExecuteScriptParams<${fieldsType}>`
    : `Omit<ExecuteScriptParams<${fieldsType}>, 'attoAlphAmount' | 'tokens'>`
  return `
    export namespace ${script.name} {
      export async function execute(signer: SignerProvider, params: ${paramsType}): Promise<ExecuteScriptResult> {
        const signerParams = await script.txParamsForExecution(signer, params)
        return await signer.signAndSubmitExecuteScriptTx(signerParams)
      }

      export const script = Script.fromJson(${script.name}ScriptJson)
    }
  `
}

function genScripts(outDir: string, artifactDir: string, exports: string[]) {
  exports.push('./scripts')
  const scriptPath = path.join(outDir, 'scripts.ts')
  const scripts = Array.from(Project.currentProject.scripts.values())
  const importArtifacts = Array.from(scripts)
    .map((s) => {
      const artifactPath = s.sourceInfo.getArtifactPath(artifactDir)
      const artifactRelativePath = path.relative(artifactDir, artifactPath)
      return `import { default as ${s.artifact.name}ScriptJson } from '../${toUnixPath(artifactRelativePath)}'`
    })
    .join('\n')
  const scriptsSource = scripts.map((s) => genScript(s.artifact)).join('\n')
  const source = `
    ${header}

    import {
      ExecuteScriptParams,
      ExecuteScriptResult,
      Script,
      SignerProvider,
      HexString
    } from '@alephium/web3'
    ${importArtifacts}

    ${scriptsSource}
  `
  const formatted = prettier.format(source, { parser: 'typescript' })
  fs.writeFileSync(scriptPath, formatted, 'utf8')
}

function genIndexTs(outDir: string, exports: string[]) {
  const indexPath = path.join(outDir, 'index.ts')
  const exportStatements = exports.map((e) => `export * from "${e}"`).join('\n')
  const source = prettier.format(header + exportStatements, { parser: 'typescript' })
  fs.writeFileSync(indexPath, source, 'utf8')
}

function genContracts(outDir: string, artifactDir: string, exports: string[]) {
  Array.from(Project.currentProject.contracts.values()).forEach((c) => {
    console.log(`Generating code for contract ${c.artifact.name}`)
    exports.push(`./${c.artifact.name}`)
    const filename = `${c.artifact.name}.ts`
    const sourcePath = path.join(outDir, filename)
    const artifactPath = c.sourceInfo.getArtifactPath(artifactDir)
    const artifactRelativePath = path.relative(artifactDir, artifactPath)
    const sourceCode = genContract(c.artifact, artifactRelativePath)
    fs.writeFileSync(sourcePath, sourceCode, 'utf8')
  })
}

export function codegen(artifactDir: string) {
  const outDirTemp = path.join(artifactDir, 'ts')
  const outDir = path.isAbsolute(outDirTemp) ? outDirTemp : path.resolve(outDirTemp)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const exports: string[] = []
  try {
    genContracts(outDir, artifactDir, exports)
    genScripts(outDir, artifactDir, exports)
    genIndexTs(outDir, exports)
  } catch (error) {
    console.log(`Failed to generate code: ${error}`)
  }
}
