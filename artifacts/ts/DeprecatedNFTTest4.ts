/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  addStdIdToFields,
  encodeContractFields,
} from "@alephium/web3";
import { default as DeprecatedNFTTest4ContractJson } from "../nft/DeprecatedNFTTest4.ral.json";
import { getContractByCodeHash } from "./contracts";
import {
  AddStruct1,
  AddStruct2,
  Balances,
  MapValue,
  TokenBalance,
  AllStructs,
} from "./types";

// Custom types for the contract
export namespace DeprecatedNFTTest4Types {
  export type Fields = {
    collectionId: HexString;
    uri: HexString;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getTokenUri: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getBool: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<boolean>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
}

class Factory extends ContractFactory<
  DeprecatedNFTTest4Instance,
  DeprecatedNFTTest4Types.Fields
> {
  encodeFields(fields: DeprecatedNFTTest4Types.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as DeprecatedNFTTest4Types.Fields;
  }

  at(address: string): DeprecatedNFTTest4Instance {
    return new DeprecatedNFTTest4Instance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest4Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params);
    },
    getBool: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest4Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<boolean>> => {
      return testMethod(this, "getBool", params);
    },
  };
}

// Use this object to test and deploy the contract
export const DeprecatedNFTTest4 = new Factory(
  Contract.fromJson(
    DeprecatedNFTTest4ContractJson,
    "",
    "a5de0fa0b3580303ac63423f09ce5ed95fccbf789679b32130a53c26fef182e9",
    AllStructs
  )
);

// Use this class to interact with the blockchain
export class DeprecatedNFTTest4Instance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<DeprecatedNFTTest4Types.State> {
    return fetchContractState(DeprecatedNFTTest4, this);
  }

  methods = {
    getTokenUri: async (
      params?: DeprecatedNFTTest4Types.CallMethodParams<"getTokenUri">
    ): Promise<DeprecatedNFTTest4Types.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        DeprecatedNFTTest4,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getBool: async (
      params?: DeprecatedNFTTest4Types.CallMethodParams<"getBool">
    ): Promise<DeprecatedNFTTest4Types.CallMethodResult<"getBool">> => {
      return callMethod(
        DeprecatedNFTTest4,
        this,
        "getBool",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  async multicall<Calls extends DeprecatedNFTTest4Types.MultiCallParams>(
    calls: Calls
  ): Promise<DeprecatedNFTTest4Types.MultiCallResults<Calls>> {
    return (await multicallMethods(
      DeprecatedNFTTest4,
      this,
      calls,
      getContractByCodeHash
    )) as DeprecatedNFTTest4Types.MultiCallResults<Calls>;
  }
}
