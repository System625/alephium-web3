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

import * as ralph from './ralph'
import * as utils from '../utils'
import { Fields, FieldsSig } from './contract'

describe('contract', function () {
  it('should encode I256', () => {
    function test(i256: bigint, expected: string) {
      expect(utils.binToHex(ralph.encodeI256(i256))).toEqual(expected)
    }
    test(BigInt('0'), '00')
    test(BigInt('1'), '01')
    test(BigInt('2'), '02')
    test(BigInt('-1'), '3f')
    test(BigInt('-2'), '3e')
    test(BigInt('32'), '4020')
    test(BigInt('33'), '4021')
    test(BigInt('34'), '4022')
    test(BigInt('31'), '1f')
    test(BigInt('30'), '1e')
    test(BigInt('8192'), '80002000')
    test(BigInt('8193'), '80002001')
    test(BigInt('8194'), '80002002')
    test(BigInt('8191'), '5fff')
    test(BigInt('8190'), '5ffe')
    test(BigInt('536870912'), 'c020000000')
    test(BigInt('536870913'), 'c020000001')
    test(BigInt('536870914'), 'c020000002')
    test(BigInt('536870911'), '9fffffff')
    test(BigInt('536870910'), '9ffffffe')
    test(
      BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819967'),
      'dc7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    test(
      BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819966'),
      'dc7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'
    )
    test(
      BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819965'),
      'dc7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd'
    )
    test(
      BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819968'),
      'dc8000000000000000000000000000000000000000000000000000000000000000'
    )
    test(
      BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819967'),
      'dc8000000000000000000000000000000000000000000000000000000000000001'
    )
    test(
      BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819966'),
      'dc8000000000000000000000000000000000000000000000000000000000000002'
    )

    function fail(n: bigint) {
      expect(() => ralph.encodeI256(n)).toThrow()
    }
    fail(BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819968'))
    fail(BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819969'))
    fail(BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819969'))
    fail(BigInt('-57896044618658097711785492504343953926634992332820282019728792003956564819970'))
  })

  it('should encode U256', () => {
    function test(u256: bigint, expected: string) {
      expect(utils.binToHex(ralph.encodeU256(u256))).toEqual(expected)
    }
    test(BigInt('0'), '00')
    test(BigInt('1'), '01')
    test(BigInt('2'), '02')
    fail(BigInt('-1'))
    fail(BigInt('-2'))
    test(BigInt('64'), '4040')
    test(BigInt('65'), '4041')
    test(BigInt('66'), '4042')
    test(BigInt('63'), '3f')
    test(BigInt('62'), '3e')
    test(BigInt('16384'), '80004000')
    test(BigInt('16385'), '80004001')
    test(BigInt('16386'), '80004002')
    test(BigInt('16383'), '7fff')
    test(BigInt('16382'), '7ffe')
    test(BigInt('1073741824'), 'c040000000')
    test(BigInt('1073741825'), 'c040000001')
    test(BigInt('1073741826'), 'c040000002')
    test(BigInt('1073741823'), 'bfffffff')
    test(BigInt('1073741822'), 'bffffffe')
    test(
      BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'),
      'dcffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
    test(
      BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639934'),
      'dcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'
    )
    test(
      BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639933'),
      'dcfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd'
    )

    function fail(n: bigint) {
      expect(() => ralph.encodeU256(n)).toThrow()
    }
    fail(BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639936'))
    fail(BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639937'))
  })

  it('should encode ByteVec', () => {
    const bytes = 'b382fc88aa31d63f4c2f3f8a03715ba2a629552e85431fb1c1d909bab46d1aae'
    const bytecode = ralph.encodeScriptFieldAsString('ByteVec', bytes)
    expect(bytecode).toEqual('144020b382fc88aa31d63f4c2f3f8a03715ba2a629552e85431fb1c1d909bab46d1aae')
  })

  it('should flatten script fields', () => {
    const fields: Fields = {
      numbers0: [
        [0n, 1n],
        [2n, 3n]
      ],
      numbers1: [0n, 1n, 2n],
      address: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3',
      bytes: '0011'
    }
    const fieldsSig: FieldsSig = {
      names: ['address', 'numbers0', 'bytes', 'numbers1'],
      types: ['Address', '[[U256;2];2]', 'ByteVec', '[U256;3]'],
      isMutable: [false, false, false, false]
    }
    const result = ralph.falttenFields(fields, fieldsSig)
    expect(result).toEqual([
      {
        name: 'address',
        type: 'Address',
        value: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3'
      },
      { name: 'numbers0[0][0]', type: 'U256', value: 0n },
      { name: 'numbers0[0][1]', type: 'U256', value: 1n },
      { name: 'numbers0[1][0]', type: 'U256', value: 2n },
      { name: 'numbers0[1][1]', type: 'U256', value: 3n },
      { name: 'bytes', type: 'ByteVec', value: '0011' },
      { name: 'numbers1[0]', type: 'U256', value: 0n },
      { name: 'numbers1[1]', type: 'U256', value: 1n },
      { name: 'numbers1[2]', type: 'U256', value: 2n }
    ])

    const invalidFields0 = { ...fields, numbers0: [0n, 1n] }
    expect(() => ralph.falttenFields(invalidFields0, fieldsSig)).toThrow(
      'Invalid field, expected type is [U256;2], but value is 0'
    )
    const invalidFields1 = { ...fields, numbers1: [[0n], [1n], [2n]] }
    expect(() => ralph.falttenFields(invalidFields1, fieldsSig)).toThrow(
      'Invalid field, expected type is U256, but value is [0]'
    )
  })

  it('should test buildScriptByteCode', () => {
    const variables = { x: true, y: 0x05n, z: 'ff', a: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3' }
    const fieldsSig: FieldsSig = {
      names: ['x', 'y', 'z', 'a'],
      types: ['Bool', 'U256', 'ByteVec', 'Address'],
      isMutable: [false, false, false, false]
    }
    const bytecode = ralph.buildScriptByteCode('-{0}-{1}-{2}-{3}-', variables, fieldsSig)
    expect(bytecode).toEqual('-03-1305-1401ff-1500a3cd757be03c7dac8d48bf79e2a7d6e735e018a9c054b99138c7b29738c437ec-')
  })

  it('should test buildContractByteCode', () => {
    const fields: Fields = {
      a: -1n,
      b: 1n,
      c: '23',
      d: '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3',
      e: [false, true]
    }
    const fieldsSig: FieldsSig = {
      names: ['a', 'b', 'c', 'd', 'e'],
      types: ['I256', 'U256', 'ByteVec', 'Address', '[Bool;2]'],
      isMutable: [false, true, false, true, false]
    }
    const encoded = ralph.buildContractByteCode('ff', fields, fieldsSig)
    expect(encoded).toEqual(
      'ff04013f030123000000010202010400a3cd757be03c7dac8d48bf79e2a7d6e735e018a9c054b99138c7b29738c437ec'
    )
  })

  it('should test buildDebugBytecode', () => {
    const bytecode = '0701402901010707061005a000a001a003a00461b413c40de0b6b3a7640000a916011602160316041605160602'
    const patch = '=7-1+e=11-1+1=20+7e01027878=50'
    const debugBytecode = ralph.buildDebugBytecode(bytecode, patch)
    expect(debugBytecode).toEqual(
      '0701402e01010707061105a000a001a003a004617e01027878b413c40de0b6b3a7640000a916011602160316041605160602'
    )
  })

  // it('should test buildByteCode', async () => {
  //   const compiled = {
  //     type: 'TemplateContractByteCode',
  //     filedLength: 1,
  //     methodsByteCode: [
  //       '01000203021205160016015f{subContractId:ByteVec}1702a00016002a16012aa100a000160016011602010002',
  //       '00000202020416001601000002'
  //     ]
  //   }
  //   const variables = { subContractId: '55834baf25f40fe5a8d6ac83c5f2b76a1677ed3ddbd6a79c4dea274992982e2b' }
  //   const bytecode = ralph.buildContractByteCode(compiled, variables)
  //   expect(bytecode).toEqual(
  //     '01024046405301000203021205160016015f14402055834baf25f40fe5a8d6ac83c5f2b76a1677ed3ddbd6a79c4dea274992982e2b1702a00016002a16012aa100a00016001601160201000200000202020416001601000002'
  //   )
  // })
})
