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
import { default as DeprecatedNFTTest2ContractJson } from "../nft/DeprecatedNFTTest2.ral.json";
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
export namespace DeprecatedNFTTest2Types {
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
    getCollectionId: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
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
  DeprecatedNFTTest2Instance,
  DeprecatedNFTTest2Types.Fields
> {
  encodeFields(fields: DeprecatedNFTTest2Types.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  getInitialFieldsWithDefaultValues() {
    return this.contract.getInitialFieldsWithDefaultValues() as DeprecatedNFTTest2Types.Fields;
  }

  at(address: string): DeprecatedNFTTest2Instance {
    return new DeprecatedNFTTest2Instance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest2Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params);
    },
    getCollectionId: async (
      params: Omit<
        TestContractParamsWithoutMaps<DeprecatedNFTTest2Types.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getCollectionId", params);
    },
  };
}

// Use this object to test and deploy the contract
export const DeprecatedNFTTest2 = new Factory(
  Contract.fromJson(
    DeprecatedNFTTest2ContractJson,
    "",
    "ade9aee476ee752050a1e9e1b19039f05261cb3f53941152617174faf9eae572",
    AllStructs
  )
);

// Use this class to interact with the blockchain
export class DeprecatedNFTTest2Instance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<DeprecatedNFTTest2Types.State> {
    return fetchContractState(DeprecatedNFTTest2, this);
  }

  methods = {
    getTokenUri: async (
      params?: DeprecatedNFTTest2Types.CallMethodParams<"getTokenUri">
    ): Promise<DeprecatedNFTTest2Types.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        DeprecatedNFTTest2,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollectionId: async (
      params?: DeprecatedNFTTest2Types.CallMethodParams<"getCollectionId">
    ): Promise<DeprecatedNFTTest2Types.CallMethodResult<"getCollectionId">> => {
      return callMethod(
        DeprecatedNFTTest2,
        this,
        "getCollectionId",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  async multicall<Calls extends DeprecatedNFTTest2Types.MultiCallParams>(
    calls: Calls
  ): Promise<DeprecatedNFTTest2Types.MultiCallResults<Calls>> {
    return (await multicallMethods(
      DeprecatedNFTTest2,
      this,
      calls,
      getContractByCodeHash
    )) as DeprecatedNFTTest2Types.MultiCallResults<Calls>;
  }
}
